export default function convertTime(createdTime, isFull = true){
  console.log('jiji=', createdTime)
    if(createdTime && typeof createdTime !== "string"){
        let date = createdTime.toDate();
        let result = date.toDateString()
        if(!isFull) return result.substring(result.indexOf(" ") + 1, result.lastIndexOf(" "))
        return result;
      }
    return createdTime;
}