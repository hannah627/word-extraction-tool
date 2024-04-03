// import { appendFile } from 'node:fs';
// import addToFile from './test';

const STOP_WORDS_LINK = "stop_words.txt";

let stopWordsList = [];

const AFINN_LEXICON_LINK = "afinn_lexicon-en-165.txt";
const LEXICON_LINK = "lexicon.txt";

let AFINN_obj = {};
let customLexiconObj = {};
let fullLexicon = {};

let currTokensList
let currToken = 0;

let tokensToAddToStopWords = [];
let tokensToAddToLexicon = [];


// when the page loads, call "init"
window.addEventListener("load", init);


// the function that runs when the page loads;
function init() {

    getFileStopWords();
    getFileLexicons(); // creates global JSON lexicon objects for the AFINN and historical lexicons

    // hiding things that shouldn't be visible when the page loads
    id("scoringSection").style.display = "none";
    id("listsSection").style.display = "none";

    // adding general event listeners (options section button, main text input)
    id("addButton").addEventListener("click", addButtonClick);
    id("ignoreButton").addEventListener("click", ignoreButtonClick);
    id("inputTextFile").addEventListener("change", processInputtedTextFile);
    // probably goign to need to add a processFileInput() event listener to each of three file inputs,
    // in that, check to see if all three have a value
    // if so, then do the last part
    // or - could add a go button, that's disabled until all three things have a file selected

}

function addButtonClick() {
    // add to lexicon
    let token = currTokensList[currToken];
    fullLexicon[token] = 6;
    tokensToAddToLexicon.push(token);
    let line = token + " 6"
    if (id("listsSection").style.display == "none") {
        id("listsSection").style.display = "flex"
    }
    appendTextElementToSection('p', id("newLexiconTokens"), line)

    displayNextToken();
    // appendFile('lexicon.txt', line, (err) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log(line + " has been successfully appended to the lexicon");
    //     }
    // })
    // addToFile('lexicon.txt', line);
}

function ignoreButtonClick() {
    // add to stopwords list
    let token = currTokensList[currToken];
    stopWordsList.push(token);
    tokensToAddToStopWords.push(token);
    // this section is hidden until at least one word is added to one of the sections
    if (id("listsSection").style.display == "none") {
        id("listsSection").style.display = "flex"
    }
    appendTextElementToSection('p', id("newStopWords"), token);

    displayNextToken();
}

function displayNextToken() {
    currToken = currToken + 1;
    id("token").textContent = currTokensList[currToken];
}



async function getFileStopWords() {
    await fetch(STOP_WORDS_LINK)
        .then(x => x.text())
        .then(x => processFileStopWords(x, stopWordsList));
}

function processFileStopWords(list, resultList) {
    let terms = list.split('\n');
    terms.forEach((term) => {
        resultList.push(term);
    })
}



async function getFileLexicons() {
// call this once when page loads; make JSON lexicons for both, then save those to variables
// then use another function to decide which of the lexicon vars to use
    Promise.all([
        fetch(AFINN_LEXICON_LINK).then(x => x.text()),
        fetch(LEXICON_LINK).then(x => x.text())
    ]).then(([afinnLexicon, customLexicon]) => {
        processFileLexicon(afinnLexicon, '\t', AFINN_obj);
        processFileLexicon(customLexicon, ' ', customLexiconObj);
        fullLexicon = {...AFINN_obj, ...customLexiconObj};
    });
}

function processFileLexicon(lexicon, separator, lexiconObj) {
    let lines = lexicon.split('\n');
    lines.forEach((line) => {
        let [word, score] = line.split(separator);

        lexiconObj[word] = score;
    })
}








function processInputtedTextFile() {
    id("scoringSection").style.display = "flex"; // unhide the buttons
    let fr = new FileReader();
    fr.onload = function() {
        let file_text = fr.result;
        processText(file_text);
        // might need to add something here to update lexicons and stopwords lists
    }
    for (let i = 0; i < this.files.length; i++) {
        let currFile = this.files[i];
        fr.readAsText(currFile);
    }
}

function processText(text) {
    currTokensList = [];

    let formatted_text = lowerCaseAndRemovePunctuationOfText(text);
    let tokens = tokenizeText(formatted_text);

    // we don't want to show any words already in lexicon or stop words lists
    let tokensSansStopWords = filterTokens(tokens, stopWordsList);
    let tokensSansLexiconTerms = filterTokens(tokensSansStopWords, Object.keys(fullLexicon));

    // removing duplicate words from the words we'll show to users
    for (let i = 0; i < tokensSansLexiconTerms.length; i++) {
        let token = tokensSansLexiconTerms[i];
        if (!currTokensList.includes(token)) {
            currTokensList.push(token);
        }
    }
    currToken = 0;

    id("token").textContent = currTokensList[currToken];
}





function lowerCaseAndRemovePunctuationOfText(text) {
    let lowerCaseText = text.toLowerCase();
    let textWithoutPunctuation = lowerCaseText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    let textWithoutExtraSpaces = textWithoutPunctuation.replace(/\s{2,}/g," ");
    return textWithoutExtraSpaces;
}

function tokenizeText(text) {
    // this process of splitting and joining is done to ensure that both newline chars and spaces are removed
    let tokens_with_newline_chars = text.split(' ');
    let rejoined_tokens = tokens_with_newline_chars.join('\n');
    let clean_tokens = rejoined_tokens.split('\n');
    return clean_tokens;
}


function filterTokens(tokens, listOfTokensToFilterOut) {
    let filteredTokens = tokens.filter((token) => !listOfTokensToFilterOut.includes(token));
    return filteredTokens;
}




function appendTextElementToSection(element, parentElement, text) {
    let e = gen(element);
    e.textContent = text;
    parentElement.append(e);
}









/**
 * a helper function to make returning an element based on id easier and faster
 * @param {string} idName - the id of the element to be located
 * @returns {Element} with id idName
 */
function id(idName) {
    return document.getElementById(idName);
}

/**
 * a helper function to make creating an element easier and faster
 * @param {string} tagName - the name of the element to create
 * @returns {Element} of type tagName
 */
function gen(tagName) {
    return document.createElement(tagName);
}