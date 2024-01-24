const itemsPerPage = 10;
let currentPage = 1;
let totalPages = 1;

async function getUserProfile(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        const user = await response.json();

        const userAvatarContainer = document.getElementById('user-avatar');
        userAvatarContainer.innerHTML = `<img src="${user.avatar_url}" alt="User Avatar">`;

        const userDetailsContainer = document.getElementById('user-details');
        userDetailsContainer.innerHTML = `
            <div><strong>Username:</strong> ${user.login}</div>
            <div><strong>Name:</strong> ${user.name || 'N/A'}</div>
            <div><strong>Followers:</strong> ${user.followers}</div>
            <div><strong>Repositories:</strong> ${user.public_repos}</div>
        `;

    } catch (error) {
        console.error(`Error fetching user profile for ${username}: ${error.message}`);
        displayErrorMessage(`Error fetching user profile: ${error.message}`);
    }
}

async function getRepositories() {
    const username = document.getElementById('username').value;
    const repositoriesContainer = document.getElementById('repositories');
    const paginationContainer = document.getElementById('pagination');
    const loader = document.getElementById('loader');
    const reposPerPage = document.getElementById('repos-per-page').value;

    try {
        loader.style.display = 'block';
        // Clear previous error messages
        displayErrorMessage('');

        // Fetch user profile
        await getUserProfile(username);

        let apiUrl = `https://api.github.com/users/${username}/repos?per_page=${reposPerPage}&page=${currentPage}`;
        const response = await fetch(apiUrl);
        const responseData = await response.json();
        const repositories = responseData.items || responseData; 

        repositoriesContainer.innerHTML = '';

        for (const repo of repositories) {
            const repoCard = document.createElement('div');
            repoCard.classList.add('card', 'repo-card');
            repoCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${repo.name}</h5>
                    <p class="card-text">${repo.description || 'No description available'}</p>
                    <a class="btn btn-primary">${repo.language || 'No language available'}</a>

                </div>
            `;
            repositoriesContainer.appendChild(repoCard);
        }

        // Pagination
        const linkHeader = response.headers.get('Link');
        if (linkHeader) {
            const matches = linkHeader.match(/<([^>]+)>;\s+rel="last"/);
            if (matches) {
                totalPages =

parseInt(new URLSearchParams(matches[1]).get('page'), 10);
            }
        }

        renderPagination();
    } catch (error) {
        console.error(`Error fetching repositories: ${error.message}`);
        displayErrorMessage(`Error fetching repositories: ${error.message}`);
    } finally {
        loader.style.display = 'none';
    }
}

function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.classList.add('btn', 'btn-secondary', 'mr-2');
        pageButton.textContent = i;
        pageButton.onclick = () => {
            currentPage = i;
            getRepositories();
        };
        paginationContainer.appendChild(pageButton);
    }
}

function displayErrorMessage(message) {
    const errorMessageContainer = document.getElementById('error-message');
    errorMessageContainer.textContent = message;
}

