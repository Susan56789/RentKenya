<template>
    <div
      :class="[
        'rounded-lg border p-4',
        variantStyles[variant],
        className
      ]"
      role="alert"
    >
      <div class="flex items-start gap-4">
        <slot name="icon"></slot>
        <div class="flex-1">
          <slot></slot>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      variant: {
        type: String,
        default: 'default',
        validator: (value) => [
          'default',
          'destructive',
          'warning',
          'info',
          'success'
        ].includes(value)
      },
      className: {
        type: String,
        default: ''
      }
    },
    computed: {
      variantStyles() {
        return {
          default: 'bg-gray-50 text-gray-900 border-gray-200',
          destructive: 'bg-red-50 text-red-900 border-red-200',
          warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
          info: 'bg-blue-50 text-blue-900 border-blue-200',
          success: 'bg-green-50 text-green-900 border-green-200'
        }
      }
    }
  }
  </script>