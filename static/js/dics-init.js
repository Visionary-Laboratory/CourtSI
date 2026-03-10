document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('#data-engine .b-dics');
  containers.forEach((container) => {
    new Dics({
      container,
      hideTexts: false,
      textPosition: 'bottom'
    });
  });
});
