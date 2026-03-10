document.addEventListener('DOMContentLoaded', () => {
  ['#example1', '#example2', '#example3', '#example4', '#example5', '#example6'].forEach(id => {
    new BeforeAfter({ id });
  });
});
