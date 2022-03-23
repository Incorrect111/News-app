// Custom Http Module
function customHttp() {
    return {
        get(url, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    console.log(response.articles)
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                xhr.send();
            } catch (error) {
                cb(error);
            }
        },
        post(url, body, headers, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                if (headers) {
                    Object.entries(headers).forEach(([key, value]) => {
                        xhr.setRequestHeader(key, value);
                    });
                }

                xhr.send(JSON.stringify(body));
            } catch (error) {
                cb(error);
            }
        },
    };
}

//Elements

const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const categorySelect = form.elements['category'];
const searchInput = form.elements['search'];


//Events
form.addEventListener('submit', (e) => {
    e.preventDefault();
    loadNews();
})


// Init http module
const http = customHttp();
const newsService = (function() {
    const apiKey = 'd4bae103f09e4b9780253a2738e6572f';
    const apiUrl = 'https://news-api-v2.herokuapp.com';

    return {
        topHeadlines(country = 'us', category = 'general', cb) {
            http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`, cb)
        },
        everything(query, cb) {
            console.log(query)
            http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb)
        }
    }
})()

//  init selects
document.addEventListener('DOMContentLoaded', function() {
    M.AutoInit();
    loadNews();
});

//Load news function
function loadNews() {
    showPreloader();

    const country = countrySelect.value;
    const category = categorySelect.value
    const searchText = searchInput.value;
    // const category;
    if (!searchText) {
        newsService.topHeadlines(country, category, onGetResponse);
    } else newsService.everything(searchText, onGetResponse)
}

//Function on get response from server
function onGetResponse(err, res) {
    removePreloader();
    if (err) {
        showAlert(err, 'error-msg');
        return;
    }
    if (!res.articles.length) {
        showAlert('Now news!!!', 'rounded')
        return;
    }

    renderNews(res.articles);
}

//Function render news
function renderNews(news) {
    const newsContainer = document.querySelector('.news-container .row');
    if (newsContainer.children.length) {
        clearContainer(newsContainer);
    }
    let fragment = '';
    news.forEach(newsItem => {
        const el = newsTemplate(newsItem);
        fragment += el;
    })

    newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

//Function clear container
function clearContainer(container) {
    let child = container.lastElementChild;
    while (child) {
        container.removeChild(child);
        child = container.lastElementChild;
    }
}

function imgNotAvaible() {
    const imgNotAvaible = document.createElement('img');
    imgNotAvaible.src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
    return imgNotAvaible;
}

//News item template function
function newsTemplate({ urlToImage, title, url, description }) {

    console.log(imgNotAvaible.src)
        // if (!urlToImage) urlToImage = imgNotAvaible;

    return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage}" onerror="${imgNotAvaible()}">
          <span class="card-title">${title || ""}</span>
        </div>
        <div class="card-content">
          <p>${description || ""}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
    `;
}

function showEmptMsg() {

}

function showAlert(msg, type = "sucess") {
    console.log(type)
    M.toast({
        html: msg,
        classes: type
    })
}

//Show preLoader
function showPreloader() {
    document.body.insertAdjacentHTML('afterbegin',
        `<div class="progress">
            <div class="indeterminate"></div>
            </div>`
    )
}

//Remove preLoader function
function removePreloader() {
    const loader = document.querySelector('.progress');
    if (loader) {
        loader.remove();
    }
}