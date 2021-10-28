function convertTime(createdTime, isFull = true) {
  if (createdTime && typeof createdTime !== "string") {
    let date = createdTime.toDate();
    let result = date.toDateString();
    if (!isFull)
      return result.substring(result.indexOf(" ") + 1, result.lastIndexOf(" "));
    return result;
  }
  return createdTime;
}

class ContentAPI {
  static _getContentMarks(content, type) {
    switch (type) {
      case "url":
        // \b 字串邊緣; s? 可以有或沒有; \/ 抓出 /; \S+ 非空白字元往下加到底
        return content.match(/\bhttps?:\/\/\S+/gi);
      case "code":
        return content.match(/codeS_[^_]*[^c]*[^o]*[^d]*[^e]*[^E]../gi);
      default:
        return content;
    }
  }
  static limitStrSize(str, maxCount) {
    return str.length > maxCount ? str.substring(0, maxCount) + "..." : str;
  }
  static removeCodeMark(str) {
    const codeMarkLength = 6;
    return str.substring(codeMarkLength, str.length - codeMarkLength);
  }
  static splitContents(content) {
    let codes = this._getContentMarks(content, "code");
    let urls = this._getContentMarks(content, "url");
    let resultArr = [];
    if (!codes && !urls) return [content];
    else if (!codes) {
      return this._convertToArr(urls, content);
    } else if (!urls) {
      return this._convertToArr(codes, content);
    } else {
      let codeArr = this._convertToArr(codes, content);
      codeArr.forEach((el) => {
        if (el.substring(0, 6) === "codeS_") {
          resultArr.push(el);
        } else if (el.includes("http") || el.includes("https")) {
          resultArr = [...resultArr, ...this._convertToArr(urls, el)];
        }
      });
      return resultArr;
    }
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
    return isFirstOnly
      ? this._parseFile(jsonImages)[0].imageSrc
      : this._parseFile(jsonImages).map((image) => image.imageSrc);
  }

  static getExif(url = null, images) {
    const image = this._getFileInfo(url, images);
    return this._parseFile(image.exif);
  }
}

export { convertTime, ContentAPI, PhotoAPI };
