<template>
  <div class="hello">
    <h3>{{title}}</h3>
    <p>
      {{content}}
    </p>
    <button type="button" class="btn btn-primary">Primary</button>
  </div>
</template>

<script>
import obj from "@/assets/data.js";

export default {
  name: 'Post',
  data() {
    return {
      content: null
    }
  },
  props: {
    title: String
  },
  watch: {
    title: function(val) {
      console.log('changed')
      obj.forEach(el=>{
        if(el['title']=== val){
      this.content = el['content'];
      } 
    })
    }
  },
  created() {
          obj.forEach(el=>{
        if(el['title']=== this.$props.title){
      this.content = el['content'];
      } 
    })
  },
}
</script>

<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
a {
  color: #42b983;
}
</style>
