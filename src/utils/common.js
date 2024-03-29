function convertTime(createdTime, isFull = true) {
	if (createdTime && typeof createdTime !== "string") {
		let date = createdTime.toDate();
		let result = date.toDateString();
		if (!isFull) return result.substring(result.indexOf(" ") + 1, result.lastIndexOf(" "));
		return result;
	}
	return createdTime;
}

class ContentAPI {
	static IMAGE_HOST_NAME = "firebasestorage.googleapis.com";
	static HTTP = "http";
	static CODES_S = "codeS_";
	static CODES_E = "_codeE";
	static BOLDS_S = "boldS_";
	static BOLDS_E = "_boldE";

	static _getContentMarks(content, type) {
		switch (type) {
			case this.HTTP:
				// \b 字串邊緣; s? 可以有或沒有; \/ 抓出 /; \S+ 非空白字元往下加到底
				return content.match(/\bhttps?:\/\/\S+/gi);
			case this.CODES_S:
				return content.match(/codeS_[^_]*[^c]*[^o]*[^d]*[^e]*[^E]*./gm);
			case this.BOLDS_S:
				return content.match(/boldS_[^_]*[^b]*[^o]*[^l]*[^d]*[^E]*./gm);
			default:
				return content;
		}
	}
	static removeMarks(str) {
		if (str.includes(this.CODES_S)) {
			str = str.replace(this.CODES_S, "").replace(this.CODES_E, "");
		} else if (str.includes(this.BOLDS_S)) {
			str = str.replace(this.BOLDS_S, "").replace(this.BOLDS_E, "");
		}
		return str;
	}
	static limitStrSize(str, maxCount) {
		return str.length > maxCount ? str.substring(0, maxCount) + "..." : str;
	}
	static isDisplay(str, type) {
		switch (type) {
			case "photo":
				// eslint-disable-next-line prettier/prettier
				return str.substring(0, 4) === this.HTTP && str.includes(this.IMAGE_HOST_NAME);
			case "link":
				return str.substring(0, 4) === this.HTTP;
			case "code":
				return str.substring(0, 6) === this.CODES_S;
			case "p":
				return this.splitParagraph(str).length === 1;
			case "bold":
				return str.substring(0, 6) === this.BOLDS_S;
		}
	}
	static splitPost(content) {
		let splitObj = this._getSplitObj(content, [this.HTTP, this.CODES_S]);
		if (!splitObj[this.CODES_S] && !splitObj[this.HTTP]) return [content];
		else if (!splitObj[this.CODES_S]) {
			return this._convertToArr(splitObj[this.HTTP], content);
		} else if (!splitObj[this.HTTP]) {
			return this._convertToArr(splitObj[this.CODES_S], content);
		} else {
			let results = this._convertToArr(splitObj[this.CODES_S], content);
			let resultArr = [];
			results.forEach((el) => {
				if (el.substring(0, 6) !== this.CODES_S && (el.includes(this.HTTP) || el.includes(this.HTTPS))) {
					resultArr = [...resultArr, ...this._convertToArr(splitObj[this.HTTP], el)];
				} else {
					resultArr.push(el);
				}
			});
			return resultArr;
		}
	}

	static splitParagraph(p) {
		let splitObj = this._getSplitObj(p, [this.BOLDS_S]);
		if (!splitObj[this.BOLDS_S]) return [p];
		else {
			let resultArr = this._convertToArr(splitObj[this.BOLDS_S], p);
			return resultArr;
		}
	}

	static _getSplitObj(content, splitKeywords) {
		let splitObj = {};
		splitKeywords.forEach((keyword) => {
			splitObj[keyword] = this._getContentMarks(content, keyword);
		});
		return splitObj;
	}

	static _convertToArr(elements, content) {
		const MARKS = "MARKS";
		elements.forEach((element) => {
			content = content.replace(element, MARKS);
		});
		let contentArr = content.split(MARKS);
		// Insert MARKS to corresponding indexes.
		elements.forEach((element, index) => {
			contentArr.splice(index * 2 + 1, 0, element);
		});
		// Remove an empty line.
		const newResult = contentArr.map((el) => el.replace(/ \n/g, "").trim());
		// Remove elements with only white spaces.
		return newResult.filter((el) => el.replace(/\s/g, "").length);
	}
}

class PhotoAPI {
	static _parseFile(jsonObj) {
		return JSON.parse(jsonObj);
	}

	static _getFileInfo(url, images) {
		if (!url) return this._parseFile(images)[0]; // Use first image
		return this._parseFile(images).find((image) => image.imageSrc === url);
	}

	static getSrc(jsonImages, isFirstOnly = false) {
		return isFirstOnly ? this._parseFile(jsonImages)[0].imageSrc : this._parseFile(jsonImages).map((image) => image.imageSrc);
	}

	static getExif(url = null, images) {
		const image = this._getFileInfo(url, images);
		return this._parseFile(image.exif);
	}
}

export { convertTime, ContentAPI, PhotoAPI };
