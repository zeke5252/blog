function convertTime(createdTime, isFull = true){
    if(createdTime && typeof createdTime !== "string"){
        let date = createdTime.toDate();
        let result = date.toDateString()
        if(!isFull) return result.substring(result.indexOf(" ") + 1, result.lastIndexOf(" "))
        return result;
      }
    return createdTime;
}

function splitContents(content){
  let urls = content.match(/\bhttps?:\/\/\S+/gi);
  if(!urls){
    return;
  }
  urls.forEach(url=>{
    content = content.replace(url, "URLS");
  })
  let contentArr = content.split("URLS")
  // Insert urls to corresponding indexes.
  urls.forEach((url,index)=>{
    contentArr.splice(index*2 + 1, 0, url)
  })
  // Remove an empty line.
  const newResult = contentArr.map( el=> el.replace(/ \n/g,'').trim())
  // Remove elements with only whitespaces.
   return newResult.filter( el=> el.replace(/\s/g, '').length )
}

let photoUtil = {

  _parseFile(jsonObj){
    return JSON.parse(jsonObj)
  },

  _getFileInfo(url, images){
    if(!url) return this._parseFile(images)[0] // Use first image
    return this._parseFile(images).find( image => image.imageSrc===url )
  },

  getPlaceholderImage(url= null, images){
    const image = this._getFileInfo(url, images)
    return `https://via.placeholder.com/${image.resolution[0]}x${image.resolution[1]}/333/333`
  },

  getSrc(images){
    return this._parseFile(images)[0].imageSrc
  },

  getExif(url= null, images){
    const image = this._getFileInfo(url, images);
    return this._parseFile(image.exif);
  }
}


export { convertTime, splitContents, photoUtil }