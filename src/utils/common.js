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
  static _getContentUrls(content) {
    return content.match(/\bhttps?:\/\/\S+/gi);
  }
  static limitStrSize(str, maxCount) {
    return str.length > maxCount ? str.substring(0, maxCount) + "..." : str;
  }
  static splitContents(content) {
    let urls = this._getContentUrls(content);
    if (!urls) {
      return content;
    } else {
      urls.forEach((url) => {
        content = content.replace(url, "URLS");
      });
      let contentArr = content.split("URLS");
      // Insert urls to corresponding indexes.
      urls.forEach((url, index) => {
        contentArr.splice(index * 2 + 1, 0, url);
      });
      // Remove an empty line.
      const newResult = contentArr.map((el) => el.replace(/ \n/g, "").trim());
      // Remove elements with only white spaces.
      return newResult.filter((el) => el.replace(/\s/g, "").length);
    }
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
