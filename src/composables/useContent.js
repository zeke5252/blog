export function useContent() {
  const IMAGE_HOST_NAME = 'firebasestorage.googleapis.com';
  const HTTP = 'http';
  const HTTPS = 'https';
  const CODES_S = 'codeS_';
  //   const CODES_E = '_codeE';
  const BOLDS_S = 'boldS_';
  //   const BOLDS_E = '_boldE';

  function _getContentMarks(content, type) {
    switch (type) {
      case HTTP:
        // \b 字串邊緣; s? 可以有或沒有; \/ 抓出 /; \S+ 非空白字元往下加到底
        return content.match(/\bhttps?:\/\/\S+/gi);
      case CODES_S:
        return content.match(/codeS_[^_]*[^c]*[^o]*[^d]*[^e]*[^E]*./gm);
      case BOLDS_S:
        return content.match(/boldS_[^_]*[^b]*[^o]*[^l]*[^d]*[^E]*./gm);
      default:
        return content;
    }
  }

  function removeMarks(str) {
    return str.replace(/(codeS_|_codeE|boldS_|_boldE)/g, '');
  }

  function limitStrSize(str, maxCount) {
    return str.length > maxCount ? str.slice(0, maxCount) + '...' : str;
  }

  function isTypeOf(str) {
    if (str.startsWith(HTTP) && str.includes(IMAGE_HOST_NAME)) {
      return 'photo';
    } else if (str.startsWith(HTTP)) {
      return 'link';
    } else if (str.startsWith(CODES_S)) {
      return 'code';
    } else if (str.startsWith(BOLDS_S)) {
      return 'bold';
    } else {
      return 'paragraph';
    }
  }

  function splitPost(content) {
    let markedElement = _formatMarkedElement(content, [HTTP, CODES_S]);
    if (!markedElement[CODES_S] && !markedElement[HTTP]) {
      return [content];
    } else if (!markedElement[CODES_S] || !markedElement[HTTP]) {
      return _convertToArr(
        markedElement[CODES_S] || markedElement[HTTP],
        content
      );
    } else {
      let results = _convertToArr(markedElement[CODES_S], content);
      let resultArr = [];
      results.forEach((result) => {
        if (
          !result.startsWith(CODES_S) &&
          (result.includes(HTTP) || result.includes(HTTPS))
        ) {
          resultArr = [
            ...resultArr,
            ..._convertToArr(markedElement[HTTP], result),
          ];
        } else {
          resultArr.push(result);
        }
      });
      return resultArr;
    }
  }

  function splitParagraph(paragraph) {
    let markedElement = _formatMarkedElement(paragraph, [BOLDS_S]);
    if (!markedElement[BOLDS_S]) {
      return [paragraph];
    } else {
      let resultArr = _convertToArr(markedElement[BOLDS_S], paragraph);
      return resultArr;
    }
  }

  function _formatMarkedElement(content, types) {
    let markedElement = {};
    types.forEach((type) => {
      markedElement[type] = _getContentMarks(content, type);
    });
    return markedElement;
  }

  function _convertToArr(elements, content) {
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

  return {
    removeMarks,
    limitStrSize,
    isTypeOf,
    splitPost,
    splitParagraph,
  };
}
