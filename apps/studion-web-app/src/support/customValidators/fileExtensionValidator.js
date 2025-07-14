const fileExtensionValidator = (extension) => (files) => {
  if (!files) {
    return false
  }
  const fileExtension = files[0].name.split('.').pop()
  return extension.includes(fileExtension)
}

export default fileExtensionValidator
