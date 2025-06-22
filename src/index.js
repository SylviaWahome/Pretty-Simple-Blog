const BASE_URL = 'http://localhost:3000/posts'; // Adjust this URL to your API endpoint

let currentPostId = null;

function displayPosts() {
  fetch(BASE_URL)
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    })
    .then(posts => {
      const postList = document.getElementById('post-list');
      postList.innerHTML = '';
      posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'post-item';
        div.dataset.id = post.id;
        div.innerHTML = `<h3>${post.title}</h3>`;
        div.addEventListener('click', () => handlePostClick(post.id));
        postList.appendChild(div);
      });
      if (posts.length > 0) {
        handlePostClick(posts[0].id);
      }
    })
    .catch(error => {
      console.error('Error fetching posts:', error);
      alert('Unable to load posts. Please try again.');
    });
}

function handlePostClick(id) {
  fetch(`${BASE_URL}/${id}`)
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch post');
      return response.json();
    })
    .then(post => {
      currentPostId = post.id;
      renderPostDetail(post);
      highlightSelectedPost(id);
    })
    .catch(error => {
      console.error('Error fetching post:', error);
      alert('Unable to load post details. Please try again.');
    });
}

function renderPostDetail(post) {
  document.getElementById('post-title').textContent = post.title;
  document.getElementById('post-content').textContent = post.content;
  document.getElementById('post-author').textContent = post.author ? `By ${post.author}` : '';
  document.getElementById('edit-button').classList.remove('hidden');
  document.getElementById('delete-button').classList.remove('hidden');
  document.getElementById('edit-post-form').classList.add('hidden');
}

function highlightSelectedPost(id) {
  document.querySelectorAll('#post-list .post-item').forEach(div => div.classList.remove('selected'));
  const selectedDiv = document.querySelector(`#post-list .post-item[data-id='${id}']`);
  if (selectedDiv) selectedDiv.classList.add('selected');
}

function addNewPostListener() {
  const form = document.getElementById('new-post-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('new-title').value.trim();
    const content = document.getElementById('new-content').value.trim();
    const author = document.getElementById('new-author').value.trim();
    if (!title || !content || !author) {
      alert('Please fill in title, content, and author.');
      return;
    }
    const newPost = { title, content, author };
    fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost)
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to create post');
        return response.json();
      })
      .then(post => {
        form.reset();
        displayPosts();
        handlePostClick(post.id);
        alert('Post added successfully! ✨');
      })
      .catch(error => {
        console.error('Error creating post:', error);
        alert('Unable to create post. Please try again.');
      });
  });
}

function setupEditListener() {
  const editButton = document.getElementById('edit-button');
  const editForm = document.getElementById('edit-post-form');
  editButton.addEventListener('click', () => {
    if (!currentPostId) return;
    fetch(`${BASE_URL}/${currentPostId}`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch post');
        return response.json();
      })
      .then(post => {
        document.getElementById('edit-title').value = post.title;
        document.getElementById('edit-content').value = post.content;
        editForm.classList.remove('hidden');
        editButton.classList.add('hidden');
      })
      .catch(error => {
        console.error('Error loading post for edit:', error);
        alert('Unable to load post for editing. Please try again.');
      });
  });

  editForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('edit-title').value.trim();
    const content = document.getElementById('edit-content').value.trim();
    if (!title || !content) {
      alert('Please fill in title and content.');
      return;
    }
    fetch(`${BASE_URL}/${currentPostId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to update post');
        return response.json();
      })
      .then(post => {
        editForm.classList.add('hidden');
        editButton.classList.remove('hidden');
        displayPosts();
        handlePostClick(post.id);
        alert('Post updated successfully! 🌟');
      })
      .catch(error => {
        console.error('Error updating post:', error);
        alert('Unable to update post. Please try again.');
      });
  });

  document.getElementById('cancel-edit').addEventListener('click', () => {
    editForm.classList.add('hidden');
    editButton.classList.remove('hidden');
  });
}

function setupDeleteListener() {
  document.getElementById('delete-button').addEventListener('click', () => {
    if (!currentPostId) return;
    if (!confirm('Are you sure you want to delete this post?')) return;
    fetch(`${BASE_URL}/${currentPostId}`, { method: 'DELETE' })
      .then(response => {
        if (!response.ok) throw new Error('Failed to delete post');
        currentPostId = null;
        document.getElementById('post-title').textContent = 'Select a post to view details';
        document.getElementById('post-content').textContent = '';
        document.getElementById('post-author').textContent = '';
        document.getElementById('edit-button').classList.add('hidden');
        document.getElementById('delete-button').classList.add('hidden');
        document.getElementById('edit-post-form').classList.add('hidden');
        displayPosts();
        alert('Post deleted successfully! 🌸');
      })
      .catch(error => {
        console.error('Error deleting post:', error);
        alert('Unable to delete post. Please try again.');
      });
  });
}

function main() {
  document.addEventListener('DOMContentLoaded', () => {
    displayPosts();
    addNewPostListener();
    setupEditListener();
    setupDeleteListener();
  });
}

main();