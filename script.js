// TMDB API 
const MOVIE_LIST = 8218973; 
const API_KEY = 'api_key=47dfcb016e14d1379095405c11c88329';
const BASE_URL = 'https://api.themoviedb.org/4';
const API_URL = BASE_URL + '/discover/movie?sort_by=popularity.desc&' + API_KEY;
const LIST_URL = BASE_URL + '/list/'+ MOVIE_LIST +'?' + API_KEY + '&page=';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchURL = BASE_URL + '/search/movie?' + API_KEY;

const weekInMilliseconds = 7*24*60*60*1000; // == 604800000 ms

// change to new one movie a week order for 0-29 with 13 first
const WEEK_ORDER = [13, 1, 22, 4, 7, 20, 0, 27, 17, 15, 14, 24, 16, 6, 28, 29, 5, 2, 3, 9, 8, 18, 11, 12, 10, 21, 19, 25, 26, 23];
START = new Date('2022-09-19T19:00:00.000Z');
const WEEK_NUM = Math.floor((Date.now() - START.valueOf())/weekInMilliseconds);
console.log(WEEK_NUM);

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');


getList(LIST_URL);


function getMovies(url){
    fetch(url).then(res => res.json()).then(data => {
        console.log(data.results);
        showMovies(data.results,0);
    })
}

async function getList(url){
    const dataResults = []
    for(let i=1;i<4;i++){
        await fetch(url+i).then(res => res.json()).then(data => {
            if(data.results){
                dataResults.push(...data.results);
            }
        })
    }
    console.log(dataResults);
    showMovies(dataResults,WEEK_NUM > WEEK_ORDER.length ? 0 : 1);
}

function showMovies(data,list){
    main.innerHTML = '';
    if(list==1){
        writeCurr(data);
    }
    writeMovies(data,list);
}

function writeCurr(data){
    const containerEl = document.createElement('div');
    containerEl.classList.add('curr_container');
    curr = [data[WEEK_ORDER[WEEK_NUM]]];
    console.log(curr);
    curr.forEach(movie => {
        const {title, poster_path, vote_average, overview, release_date} = movie;
        let dateStr = '';
        if(release_date){
            dateStr = ' (' + release_date.substring(0, 4) + ')';
        }
        const movieEl = document.createElement('div');
        movieEl.classList.add('curr');
        movieEl.innerHTML = `
        <img src="${IMG_URL + poster_path}" alt="${title}" class="unwatched">

            <div class="movie-info">
                <h3>${title + dateStr}</h3>
                <span class="${getColor(vote_average)}">${vote_average}</span>
            </div>

            <div class="overview">
                ${overview}
            </div>
            `
            containerEl.appendChild(movieEl);
    })
    main.appendChild(containerEl);
}

function writeMovies(data,list){
    const containerEl = document.createElement('div');
    containerEl.classList.add('list_container');
    let index = 0;
    data.forEach(movie => {
        const {title, poster_path, vote_average, overview, release_date} = movie;
        let dateStr = '';
        if(release_date){
            dateStr = ' (' + release_date.substring(0, 4) + ')';
        }
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        movieEl.innerHTML = `
        <img src="${IMG_URL + poster_path}" alt="${title}" class="${getWatched(index,list)}">

            <div class="movie-info">
                <h3>${title + dateStr}</h3>
                <span class="${getColor(vote_average)}">${vote_average}</span>
            </div>

            <div class="overview">
                ${overview}
            </div>
            `
            containerEl.appendChild(movieEl);
            index++;
    })
    main.appendChild(containerEl);
}

function getColor(vote){
    if(vote >= 8){
        return "green"
    } else if(vote >= 5){
        return "orange"
    }else{
        return "red"
    }
}

function getWatched(index, list){
    if(list == 0){
        return "unwatched"
    }
    const seen = {};
    for(let i = 0;i<WEEK_NUM;i++){
        seen[WEEK_ORDER[i][0]] = "ah";
        seen[WEEK_ORDER[i][1]] = "oh";
    }
    if(index in seen){ 
        return "watched"
    }
    return "unwatched"
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const searchTerm = search.value;
    if(searchTerm){
        getMovies(searchURL + '&query=' + searchTerm)
    }else{
        getMovies(API_URL);
    }
})
