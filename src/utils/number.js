class NumberJS {
  constructor(value) {
    this.value = parseInt(value)
  }

  inGeneral() {
    if (Math.round(this.value / 1000000) > 0) {
      return `${Math.round(this.value / 1000000)}M`
    } else if (Math.round(this.value / 1000) > 0) {
      return `${Math.round(this.value / 1000)}K`
    } else {
      return this.value.toString()
    }
  }

  toString() {
    return this.value.toString()
  }
}

export function numberjs(value) {
  return new NumberJS(value)
}
