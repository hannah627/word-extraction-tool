"use strict";

(function() {

const STOP_WORDS_LINK = "stop_words.txt";

let stopWordsList = [];

let currTokensList = new Set();
let setIter = currTokensList[Symbol.iterator]();
// let currToken = 0;


// when the page loads, call "init"
window.addEventListener("load", init);


// the function that runs when the page loads;
function init() {

    getFileStopWords();

    // hiding things that shouldn't be visible when the page loads
    id("buttonsSection").style.display = "none";

    // adding general event listeners (options section button, main text input)
    id("addButton").addEventListener("click", addButtonClick);
    id("ignoreButton").addEventListener("click", ignoreButtonClick);
    // id("input").addEventListener("input", processInputtedText);
    id("inputFile").addEventListener("change", processInputtedFile);

}

function addButtonClick() {
    // currToken = currToken + 1;
    console.log("add button clicked!");
    id("token").textContent = setIter.next().value;
}

function ignoreButtonClick() {
    // currToken = currToken + 1;
    console.log("ingore button clicked!");
    id("token").textContent = setIter.next().value;
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








function processInputtedFile() {
    id("buttonsSection").style.display = "flex"; // unhide the buttons
    let fr = new FileReader();
    fr.onload = function() {
        let file_text = fr.result;
        processText(file_text);
    }
    for (let i = 0; i < this.files.length; i++) {
        let currFile = this.files[i];
        fr.readAsText(currFile);
    }
}

function processText(text) {
    currTokensList = currTokensList.clear();
    let formatted_text = lowerCaseAndRemovePunctuationOfText(text);
    let tokens = tokenizeText(formatted_text);
    // console.log(tokens)
    let filteredTokens = removeStopWords(tokens, stopWordsList);
    // console.log(stopWordsList)
    // console.log(filteredTokens)

    // filteredTokens.forEach((token) => {
    //     currTokensList.add(token);
    // })

    for (let i = 0; i < filteredTokens.length; i++) {
        let item = filteredTokens[i];
        currTokensList.add(item);
    }

    // currTokensList = filteredTokens;
    // currToken = 0;
    id("token").textContent = setIter.next().value; //currTokensList[currToken];

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


function removeStopWords(tokens, stopWordsList) {
    let filteredTokens = tokens.filter((token) => !stopWordsList.includes(token))
    return filteredTokens
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

})();