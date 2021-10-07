;(function () {
  const imageInput = document.querySelector('#imageInput')
  const image = document.querySelector('#image')

  imageInput.addEventListener('change', e => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()

    reader.addEventListener('load', () => {
      image.src = reader.result
      image.classList.remove('hidden')
    })

    reader.readAsDataURL(file)
  })
})()
