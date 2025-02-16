<template>
    <div :class="['p-6 pt-0', className]">
      <slot></slot>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      className: {
        type: String,
        default: ''
      }
    }
  }
  </script>