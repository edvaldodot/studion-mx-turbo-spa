import { req } from 'vuelidate/lib/validators/common'

const validateMimeType = (mimeType) => (files) => {
  if (!req(files)) return true
  /*
  *   Algumas versões de navegadores no Windows não conseguem retornar o mimeType do arquivo.
  *   Após pesquisar por possibilidades foi encontrado o seguinte LINK. https://github.com/danialfarid/ng-file-upload/issues/1211
  *   Onde as pessoas também estavam com o mesmo problema, porém não havia uma solução definitiva para o problema.
  *   Portanto foi implementado um WorkAround para validação, onde será feito uma validação superficial através da extensão do nome do arquivo,
  *   caso ele não tenha um `type` definido.
  *   Nesses casos a validação fica sob resposabilidade da API em validar o arquivo.
  */
  const getFileType = '\\.([a-zA-Z]*)'
  if (!files) {
    return false
  }
  if (files[0].type) {
    return mimeType.includes(files[0].type)
  }
  return mimeType.includes(files[0].name.match(getFileType)[1])
}

export default validateMimeType
