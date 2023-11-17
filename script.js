// TMDB API 
const MOVIE_LIST = 8279609; 
const API_KEY = 'api_key=47dfcb016e14d1379095405c11c88329';
const BASE_URL = 'https://api.themoviedb.org/4';
const API_URL = BASE_URL + '/discover/movie?sort_by=popularity.desc&' + API_KEY;
const LIST_URL = BASE_URL + '/list/'+ MOVIE_LIST +'?' + API_KEY + '&page=';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchURL = BASE_URL + '/search/movie?' + API_KEY;

const weekInMilliseconds = 7*24*60*60*1000; // == 604800000 ms

const NUMPEOPLE = 13;
const NUMMOVIESEACH = 3;
const ORDERSEED = "merriam.webster";
const WEEK_ORDER = getWeekOrder(NUMPEOPLE,NUMMOVIESEACH,ORDERSEED);
START = new Date('2023-11-17T20:00:00.000Z'); 
const WEEK_NUM = Math.floor((Date.now() - START.valueOf())/weekInMilliseconds);

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');


getList(LIST_URL);

function shuffleArray(array, seed) {
    Math.seedrandom(seed);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getWeekOrder(numPeople, numMovies, seed) {
    // itll always be a 2d array with numbers 0->n*m-1 in order
    // chunked into n rows of m numbers
    // n == 2 m ==3 : [[0,1,2],[3,4,5]]
    Math.seedrandom(seed);
    const array2d = [];
    for (let i = 0; i < numPeople; i++){
        let k = i*numMovies;
        const tmp = [];
        for (let j = 0; j < numMovies; j++){
            tmp.push(k+j);
        }
        array2d.push(tmp);
    }
    const items = [];
    const v = [];
    for (let i = 0; i < numPeople; i++){
        shuffleArray(array2d[i], seed+i);
        items.push(...array2d[i]);
        const io = Math.random()/numMovies;
        const o = [];
        let oRange = 0.1/numMovies;
        for (let k = 0; k < numMovies; k++){
            // should be between -0.1/nM and 0.1/nM
            o.push(Math.random() * 2 * oRange - oRange); 
        }
        for (let k = 0; k < numMovies; k++){
            v.push(k/numMovies + io + o[k]);
        }
        
    }
    items.sort(function(a, b){return v[a] - v[b]});
    return items;
}


function getMovies(url){
    fetch(url).then(res => res.json()).then(data => {
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
    showMovies(dataResults,WEEK_NUM > WEEK_ORDER.length || WEEK_NUM < 0 ? 0 : 1);
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
    curr.forEach(movie => {
        const {title, poster_path, vote_average, overview, release_date, id} = movie;
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
                <a href="https://letterboxd.com/tmdb/${id}" target="_blank" rel="noopener noreferrer">Open in LetterBoxd</a>
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
        const {title, poster_path, vote_average, overview, release_date, id} = movie;
        let dateStr = '';
        if(release_date){
            dateStr = ' (' + release_date.substring(0, 4) + ')';
        }
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        movieEl.innerHTML = `
        <img src="${IMG_URL + poster_path}" alt="${title}" class="${getWatched(index,list)}">

            <div class="movie-info">
                <h5>${title + dateStr}</h5>
                <span class="${getColor(vote_average)}">${vote_average}</span>
            </div>

            <div class="overview">
                ${overview.substring(0,150)}...
                <a href="https://letterboxd.com/tmdb/${id}" target="_blank" rel="noopener noreferrer">Open in LetterBoxd</a>
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
        seen[WEEK_ORDER[i]] = "ah";
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
