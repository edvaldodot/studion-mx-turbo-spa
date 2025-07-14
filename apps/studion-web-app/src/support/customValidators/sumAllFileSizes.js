import { withParams } from 'vuelidate/lib/validators/common'

export default (sizeLimit) => {
  return withParams({ type: 'maxSizeAllowed', sizeLimit }, function (fileList) {
    if (!fileList || !Array.isArray(fileList) || !fileList.length) return true

    const allSizesSum = fileList.reduce((accumulator, current) => accumulator + Number(current.size || current.filesize), 0)
    return allSizesSum <= sizeLimit
  })
}
