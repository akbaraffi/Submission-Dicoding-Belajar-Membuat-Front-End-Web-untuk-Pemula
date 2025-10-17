let books = [];
const RENDER_EVENT = 'render-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function generateBookObject(id, title, author, year, isComplete) {
  return { id, title, author, year, isComplete };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() {
  if (typeof (Storage) === 'undefined') {
    alert('Browser tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBook() {
  const title = document.getElementById('bookFormTitle').value;
  const author = document.getElementById('bookFormAuthor').value;
  const year = parseInt(document.getElementById('bookFormYear').value, 10);
  const isComplete = document.getElementById('bookFormIsComplete').checked;
  const id = new Date().getTime();
  const bookObject = generateBookObject(id, title, author, year, isComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  document.getElementById('bookForm').reset();
  updateButton();
}

function toggleBookComplete(bookId) {
  const target = findBook(bookId);

  if (target == null) return;

  target.isComplete = !target.isComplete;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBook(bookId) {
  const target = findBook(bookId);
  if (!target) return;

  const newTitle = prompt('Judul buku:', target.title);
  if (newTitle === null) return;

  const newAuthor = prompt('Penulis:', target.author);
  if (newAuthor === null) return;

  const newYear = prompt('Tahun rilis:', target.year);
  if (newYear === null) return;

  target.title = newTitle;
  target.author = newAuthor;
  target.year = parseInt(newYear, 10);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeBookElement(book) {
  const { id, title, author, year, isComplete } = book;

  const container = document.createElement('div');
  container.dataset.bookid = String(id);
  container.setAttribute('data-testid', 'bookItem');

  const h3 = document.createElement('h3');
  h3.setAttribute('data-testid', 'bookItemTitle');
  h3.textContent = title;

  const pAuthor = document.createElement('p');
  pAuthor.setAttribute('data-testid', 'bookItemAuthor');
  pAuthor.textContent = `Penulis: ${author}`;

  const pYear = document.createElement('p');
  pYear.setAttribute('data-testid', 'bookItemYear');
  pYear.textContent = `Tahun: ${year}`;

  const btnWrap = document.createElement('div');

  const toggleBtn = document.createElement('button');
  toggleBtn.setAttribute('data-testid', 'bookItemIsCompleteButton');
  toggleBtn.textContent = isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
  toggleBtn.addEventListener('click', () => toggleBookComplete(id));

  const deleteBtn = document.createElement('button');
  deleteBtn.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteBtn.textContent = 'Hapus Buku';
  deleteBtn.addEventListener('click', () => deleteBook(id));

  const editBtn = document.createElement('button');
  editBtn.setAttribute('data-testid', 'bookItemEditButton');
  editBtn.textContent = 'Edit Buku';
  editBtn.addEventListener('click', () => editBook(id));

  btnWrap.append(toggleBtn, deleteBtn, editBtn);
  container.append(h3, pAuthor, pYear, btnWrap);

  return container;
}

let searchBookQuery = '';
function setSearchBook(q) {
  searchBookQuery = q.trim().toLowerCase();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function updateButton() {
  const checkbox = document.getElementById('bookFormIsComplete');
  const btn = document.getElementById('bookFormSubmit');
  const span = btn.querySelector('span');

  if (!span) return;
  span.textContent = checkbox.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookForm');
  const isComplete = document.getElementById('bookFormIsComplete');
  const searchBook = document.getElementById('searchBook');
  const searchInput = document.getElementById('searchBookTitle');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addBook();
  });

  isComplete.addEventListener('change', updateButton);
  updateButton();

  searchBook.addEventListener('submit', (e) => {
    e.preventDefault();
    setSearchBook(searchInput.value || '');
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, () => {
  const incompleteList = document.getElementById('incompleteBookList');
  const completeList = document.getElementById('completeBookList');

  incompleteList.innerHTML = '';
  completeList.innerHTML = '';

  const filtered = searchBookQuery
    ? books.filter(book => book.title.toLowerCase().includes(searchBookQuery))
    : books;

  for (const book of filtered) {
    const bookElement = makeBookElement(book);  
    if (book.isComplete) completeList.append(bookElement);
    else incompleteList.append(bookElement);
  }
});
