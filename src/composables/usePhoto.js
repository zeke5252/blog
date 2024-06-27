export function usePhoto() {
  function _parseFile(jsonObj) {
    return JSON.parse(jsonObj);
  }

  function _getFileInfo(imageUrl, images) {
    const parsedImages = _parseFile(images);
    if (!imageUrl) return parsedImages[0]; // Use first image
    return parsedImages.find((image) => image.imageSrc === imageUrl);
  }

  function getSrc(jsonImages, isFirstOnly = false) {
    const parsedImages = _parseFile(jsonImages);
    return isFirstOnly
      ? parsedImages[0]?.imageSrc
      : parsedImages.map((image) => image.imageSrc);
  }

  function getExif(url = null, images) {
    const fileInfo = _getFileInfo(url, images);
    return fileInfo ? _parseFile(fileInfo.exif) : null;
  }

  return { getSrc, getExif };
}
