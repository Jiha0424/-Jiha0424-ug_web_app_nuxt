export const useMessageToast = () => {
  const toast = useToast();
  const defaultLife = ref(3000);

  const saveToast = () => {
    customToast(
      'success',
      '데이터 저장 성공',
      '데이터가 정상적으로 저장 되었습니다.'
    );
  };

  const deleteToast = () => {
    customToast(
      'info',
      '데이터 삭제 성공',
      '데이터가 정상적으로 삭제 되었습니다.'
    );
  };

  const failToast = () => {
    customToast('error', '데이터 조작 실패', '데이터 조작에 실패 하였습니다.');
  };

  const validToast = () => {
    customToast(
      'warn',
      '필수정보 누락',
      '필수정보를 입력 및 선택 하셔야 합니다.'
    );
  };

  const customToast = (severity, summary, detail) => {
    toast.add({
      severity: severity ? severity : 'error',
      summary: summary ? summary : '문제 발생',
      detail: detail ? detail : '알수없는 문제',
      life: defaultLife.value,
    });
  };

  return { saveToast, deleteToast, failToast, validToast, customToast };
};
