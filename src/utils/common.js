function convertTime(createdTime, isFull = true) {
  if (createdTime && typeof createdTime !== 'string') {
    let date = createdTime.toDate();
    let result = date.toDateString();
    if (!isFull) return `${result.split(' ')[1]} ${result.split(' ')[2]}`;
    return result;
  }
  return createdTime;
}

class ContentAPI {
  static IMAGE_HOST_NAME = 'firebasestorage.googleapis.com';
  static HTTP = 'http';
  static CODES_S = 'codeS_';
  static CODES_E = '_codeE';
  static BOLDS_S = 'boldS_';
  static BOLDS_E = '_boldE';

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
    return str.replace(/(codeS_|_codeE|boldS_|_boldE)/g, '');
  }
  static limitStrSize(str, maxCount) {
    return str.length > maxCount ? str.slice(0, maxCount) + '...' : str;
  }
  static isTypeOf(str) {
    if (str.startsWith(this.HTTP) && str.includes(this.IMAGE_HOST_NAME)) {
      return 'photo';
    } else if (str.startsWith(this.HTTP)) {
      return 'link';
    } else if (str.startsWith(this.CODES_S)) {
      return 'code';
    } else if (str.startsWith(this.BOLDS_S)) {
      return 'bold';
    } else {
      return 'paragraph';
    }
  }
  static splitPost(content) {
    let markedElement = this._formatMarkedElement(content, [
      this.HTTP,
      this.CODES_S,
    ]);
    if (!markedElement[this.CODES_S] && !markedElement[this.HTTP]) {
      return [content];
    } else if (!markedElement[this.CODES_S] || !markedElement[this.HTTP]) {
      return this._convertToArr(
        markedElement[this.CODES_S] || markedElement[this.HTTP],
        content
      );
    } else {
      let results = this._convertToArr(markedElement[this.CODES_S], content);
      let resultArr = [];
      results.forEach((result) => {
        if (
          !result.startsWith(this.CODES_S) &&
          (result.includes(this.HTTP) || result.includes(this.HTTPS))
        ) {
          resultArr = [
            ...resultArr,
            ...this._convertToArr(markedElement[this.HTTP], result),
          ];
        } else {
          resultArr.push(result);
        }
      });
      return resultArr;
    }
  }

  static splitParagraph(paragraph) {
    let markedElement = this._formatMarkedElement(paragraph, [this.BOLDS_S]);
    if (!markedElement[this.BOLDS_S]) {
      return [paragraph];
    } else {
      let resultArr = this._convertToArr(
        markedElement[this.BOLDS_S],
        paragraph
      );
      return resultArr;
    }
  }

  static _formatMarkedElement(content, types) {
    let markedElement = {};
    types.forEach((type) => {
      markedElement[type] = this._getContentMarks(content, type);
    });
    return markedElement;
  }

  static _convertToArr(elements, content) {
    const MARKS = 'MARKS';
    elements.forEach((element) => {
      content = content.replace(element, MARKS);
    });
    const contentArr = content.split(MARKS);
    // Insert MARKS to corresponding indexes.
    elements.forEach((element, index) => {
      contentArr.splice(index * 2 + 1, 0, element);
    });
    // Remove empty line.
    const newResult = contentArr.map((el) => el.replace(/ \n/g, '').trim());
    // Remove elements with only white spaces.
    return newResult.filter((el) => el.replace(/\s/g, '').length);
  }
}

class PhotoAPI {
  static _parseFile(jsonObj) {
    return JSON.parse(jsonObj);
  }

  static _getFileInfo(imageUrl, images) {
    const parsedImages = this._parseFile(images);
    if (!imageUrl) return parsedImages[0]; // Use first image
    return parsedImages.find((image) => image.imageSrc === imageUrl);
  }

  static getSrc(jsonImages, isFirstOnly = false) {
    const parsedImages = this._parseFile(jsonImages);
    return isFirstOnly
      ? parsedImages[0]?.imageSrc
      : parsedImages.map((image) => image.imageSrc);
  }

  static getExif(url = null, images) {
    const fileInfo = this._getFileInfo(url, images);
    return fileInfo ? this._parseFile(fileInfo.exif) : null;
  }
}

export { convertTime, ContentAPI, PhotoAPI };
