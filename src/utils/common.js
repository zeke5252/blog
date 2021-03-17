export default function convertTime(createdTime, isFull = true){
    if(createdTime && typeof createdTime !== "string"){
        let date = createdTime.toDate();
        let result = date.toDateString()
        if(!isFull) return result.substring(result.indexOf(" ") + 1, result.lastIndexOf(" "))
        return result;
      }
    return createdTime;
}