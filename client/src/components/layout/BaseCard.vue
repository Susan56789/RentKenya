<template>
    <div :class="['bg-white rounded-lg border border-gray-200 shadow-sm', className]">
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