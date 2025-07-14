export const filesQuotaAllowedMimeTypes = (state) => {
  return (state.examinationFilesQuota && state.examinationFilesQuota.mimeTypes) || []
}
