<script setup>
  
    
      
  function logout(){
    navigateTo('/')
  }


</script>

<template>
    <h1>Welcome!</h1>
    <button @click="logout">Logout</button>
</template>

<style scoped>

</style>