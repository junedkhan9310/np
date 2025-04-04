// Firebase Configuration - Replace with your own config
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBbASBEqP1KltINK8mA-cMguudm3A6hTfA",
    authDomain: "trial-8f3cb.firebaseapp.com",
    databaseURL: "https://trial-8f3cb-default-rtdb.firebaseio.com",
    projectId: "trial-8f3cb",
    storageBucket: "trial-8f3cb.firebasestorage.app",
    messagingSenderId: "518428421959",
    appId: "1:518428421959:web:11cb84c3a4e49065c6e662",
    measurementId: "G-DB8QGLM8FD"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data structure to hold the content of the books
let books = {
  1: "",
  2: "",
  3: "",
};

let currentBook = 1; // Start with Book 1
let isInitialLoad = true;

// Create particles for background effect
function createParticles() {
  const particlesContainer = document.getElementById("particles");
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");

    // Random size between 2-6px
    const size = Math.random() * 4 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    // Random position
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;

    // Random animation delay
    particle.style.animationDelay = `${Math.random() * 5}s`;

    particlesContainer.appendChild(particle);
  }
}

// Fetch books from Firestore
async function fetchBooks() {
  updateSyncStatus("syncing");

  try {
    const booksCollection = collection(db, "books");
    const bookIds = ["1", "2", "3"];

    for (const bookId of bookIds) {
      const bookRef = doc(booksCollection, bookId);
      const bookDoc = await getDoc(bookRef);

      if (bookDoc.exists()) {
        books[bookId] = bookDoc.data().content;
      } else {
        // Create the document if it doesn't exist
        await setDoc(bookRef, { content: "" });
        books[bookId] = "";
      }
    }

    updateSyncStatus("synced");
  } catch (error) {
    console.error("Error fetching books:", error);
    updateSyncStatus("error");
  }
}

// Update the sync status indicator
function updateSyncStatus(status) {
  const syncStatus = document.getElementById("sync-status");

  switch (status) {
    case "syncing":
      syncStatus.innerHTML = '<i class="fa-solid fa-sync"></i> Syncing...';
      syncStatus.classList.add("syncing");
      break;
    case "synced":
      syncStatus.innerHTML = '<i class="fa-solid fa-check"></i> Synced';
      syncStatus.classList.remove("syncing");
      setTimeout(() => {
        syncStatus.innerHTML = '<i class="fa-solid fa-cloud"></i> Ready';
      }, 2000);
      break;
    case "saving":
      syncStatus.innerHTML = '<i class="fa-solid fa-sync"></i> Saving...';
      syncStatus.classList.add("syncing");
      break;
    case "error":
      syncStatus.innerHTML =
        '<i class="fa-solid fa-exclamation-triangle"></i> Error';
      syncStatus.classList.remove("syncing");
      break;
    default:
      syncStatus.innerHTML = '<i class="fa-solid fa-cloud"></i> Ready';
      syncStatus.classList.remove("syncing");
  }
}

// Switch between books
function switchBook(bookNumber) {
  currentBook = bookNumber;
  document.getElementById("notepad").value = books[currentBook];

  // Update active button
  document.querySelectorAll(".book-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.getElementById(`book${bookNumber}-btn`).classList.add("active");

  // Auto-copy content to clipboard on book switch (except initial load)
  if (!isInitialLoad) {
    copyToClipboard(true);
  }
}

// Save the content to Firestore
async function saveFile() {
  const content = document.getElementById("notepad").value;
  books[currentBook] = content;

  updateSyncStatus("saving");

  try {
    // Update Firestore with the new content
    const bookRef = doc(collection(db, "books"), currentBook.toString());
    await setDoc(bookRef, {
      content: content,
    });

    updateSyncStatus("synced");
  } catch (error) {
    console.error("Error saving content:", error);
    updateSyncStatus("error");
  }
}

// Copy the content to the clipboard
function copyToClipboard(silent = false) {
  const text = document.getElementById("notepad").value;
  navigator.clipboard
    .writeText(text)
    .then(() => {
      if (!silent) {
        showCopyStatus();
      }
    })
    .catch((err) => {
      console.error("Error copying text: ", err);
    });
}

// Show and then hide the copy status
function showCopyStatus() {
  const copyStatus = document.getElementById("copy-status");
  copyStatus.classList.remove("hidden");
  copyStatus.classList.add("show");

  setTimeout(() => {
    copyStatus.classList.remove("show");
    setTimeout(() => {
      copyStatus.classList.add("hidden");
    }, 300);
  }, 2000);
}

// Initialize the application
window.onload = async function () {
  createParticles();
  await fetchBooks();
  document.getElementById("notepad").value = books[currentBook];

  // Automatically copy content to clipboard on first load
  if (books[currentBook].trim() !== "") {
    copyToClipboard(true);
  }

  isInitialLoad = false;
};

// Expose functions to global scope for HTML onclick attributes
window.switchBook = switchBook;
window.saveFile = saveFile;
window.copyToClipboard = copyToClipboard;
