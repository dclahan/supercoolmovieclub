// TMDB API 
const TOY_LIST = 8203787;
const MOVIE_LIST = 8204010;//8203750
const API_KEY = 'api_key=47dfcb016e14d1379095405c11c88329';
const BASE_URL = 'https://api.themoviedb.org/4';
const API_URL = BASE_URL + '/discover/movie?sort_by=popularity.desc&' + API_KEY;
// const LIST_URL = BASE_URL + '/list/'+ TOY_LIST +'?' + API_KEY + '&page=';
const LIST_URL = BASE_URL + '/list/'+ MOVIE_LIST +'?' + API_KEY + '&page=';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchURL = BASE_URL + '/search/movie?' + API_KEY;

const weekInMilliseconds = 7*24*60*60*1000; // == 604800000 ms

const TOY_WEEK_ORDER = [[19, 21], [23, 18], [13, 6], [9, 1], [22, 15], [5, 17], [2, 11], [14, 4], [12, 16], [3, 7], [0, 20], [10, 8]];
const TOY_START = new Date('2022-04-12T06:00:00.000Z');
var TOY_WEEK_NUM = Math.floor((Date.now() - TOY_START.valueOf())/weekInMilliseconds);

const WEEK_ORDER = [[19, 12], [1, 20], [6, 14], [31, 11], [24, 16], [37, 22], [33, 15], [13, 26], [40, 7], [5, 39], [41, 18], [21, 8], [36, 47], [48, 0], [23, 45], [28, 50], [34, 2], [17, 25], [10, 44], [55, 49], [35, 56], [59, 51], [58, 53], [3, 29], [27, 38], [32, 46], [4, 30], [54, 43], [9, 57], [42, 52]];
const START = new Date('2022-01-20T19:00:00.000Z');
const WEEK_NUM = Math.floor((Date.now() - START.valueOf())/weekInMilliseconds);

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
    // curr = [data[TOY_WEEK_ORDER[TOY_WEEK_NUM][0]], data[TOY_WEEK_ORDER[TOY_WEEK_NUM][1]]];
    curr = [data[WEEK_ORDER[WEEK_NUM][0]], data[WEEK_ORDER[WEEK_NUM][1]]];
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
    // for(let i = 0;i<TOY_WEEK_NUM-1;i++){
    //     seen[TOY_WEEK_ORDER[i][0]] = "ah";
    //     seen[TOY_WEEK_ORDER[i][1]] = "oh";
    // }
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
