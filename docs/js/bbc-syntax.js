const elements = document.getElementsByClassName('bbcode-code')
for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    SyntaxHiglight(element)
}

function SyntaxHiglight(elmnt) {
    const elmntObj = elmnt
    const commentcolor = '#57a64a'
    const jscolor = '#dcdcdc'
    const jskeywordcolor = '#569cd6'
    const jsstringcolor = '#d69d85'
    const jsnumbercolor = '#b5cea8'
    const jspropertycolor = "black"

    const colors = {
        comment: '#57a64a',
        default: '#dcdcdc',
        keyword: '#569cd6',
        string: '#d69d85',
        number: '#b5cea8',
        function: '#dcdcaa',
        variable: '#9cdcfe',
        statement: '#d8a0df'
    }

    elmntObj.innerHTML = jsMode(elmntObj.innerHTML)

    function commentMode(txt) {
        return "<span style=color:" + commentcolor + ">" + txt + "</span>";
    }
    function jsMode(txt) {
        var rest = txt, done = "", esc = [], i, cc, tt = "", sfnuttpos, dfnuttpos, compos, comlinepos, keywordpos, statementpos, numpos, mypos, dotpos, y;
        for (i = 0; i < rest.length; i++) {
            cc = rest.substr(i, 1);
            if (cc == "\\") {
                esc.push(rest.substr(i, 2));
                cc = "W3JSESCAPE";
                i++;
            }
            tt += cc;
        }
        rest = tt;
        y = 1;
        while (y == 1) {
            sfnuttpos = getPos(rest, "'", "'", jsStringMode);
            dfnuttpos = getPos(rest, '"', '"', jsStringMode);
            compos = getPos(rest, /\/\*/, "*/", commentMode);
            comlinepos = getPos(rest, /\/\//, "<br>", commentMode);
            numpos = getNumPos(rest, jsNumberMode);
            keywordpos = getKeywordPos("js", rest, jsKeywordMode);
            statementpos = getStatementPos("js", rest, jsStatementMode);
            dotpos = getDotPos(rest, jsPropertyMode);
            if (Math.max(numpos[0], sfnuttpos[0], dfnuttpos[0], compos[0], comlinepos[0], keywordpos[0], statementpos[0], dotpos[0]) == -1) { break; }
            mypos = getMinPos(numpos, sfnuttpos, dfnuttpos, compos, comlinepos, keywordpos, statementpos, dotpos);
            if (mypos[0] == -1) { break; }
            if (mypos[0] > -1) {
                done += rest.substring(0, mypos[0]);
                done += mypos[2](rest.substring(mypos[0], mypos[1]));
                rest = rest.substr(mypos[1]);
            }
        }
        rest = done + rest;
        for (i = 0; i < esc.length; i++) {
            rest = rest.replace("W3JSESCAPE", esc[i]);
        }

        rest = rest.replace(/TB/g, `<div style="width: 20px; display: inline-block;"></div>`)

        return "<span style=color:" + jscolor + ">" + rest + "</span>";
    }
    function jsStringMode(txt) {
        return "<span style=color:" + jsstringcolor + ">" + txt + "</span>";
    }
    function jsKeywordMode(txt) {
        return "<span style=color:" + jskeywordcolor + ">" + txt + "</span>";
    }
    function jsStatementMode(txt) {
        return "<span style=color:" + colors.statement + ">" + txt + "</span>";
    }
    function jsNumberMode(txt) {
        return "<span style=color:" + jsnumbercolor + ">" + txt + "</span>";
    }
    function jsPropertyMode(txt) {
        return "<span style=color:" + jspropertycolor + ">" + txt + "</span>";
    }
    function getDotPos(txt, func) {
        var x, i, j, s, e, arr = [".", "<", " ", ";", "(", "+", ")", "[", "]", ",", "&", ":", "{", "}", "/", "-", "*", "|", "%"];
        s = txt.indexOf(".");
        if (s > -1) {
            x = txt.substr(s + 1);
            for (j = 0; j < x.length; j++) {
                cc = x[j];
                for (i = 0; i < arr.length; i++) {
                    if (cc.indexOf(arr[i]) > -1) {
                        e = j;
                        return [s + 1, e + s + 1, func];
                    }
                }
            }
        }
        return [-1, -1, func];
    }
    function getMinPos() {
        var i, arr = [];
        for (i = 0; i < arguments.length; i++) {
            if (arguments[i][0] > -1) {
                if (arr.length == 0 || arguments[i][0] < arr[0]) { arr = arguments[i]; }
            }
        }
        if (arr.length == 0) { arr = arguments[i]; }
        return arr;
    }
    function getKeywordPos(typ, txt, func) {
        var words, i, pos, rpos = -1, rpos2 = -1, patt;
        if (typ == "js") {
            words = ['void', 'string', 'int', 'bool', 'struct', 'true', 'false', 'using'];
        }
        for (i = 0; i < words.length; i++) {
            pos = txt.indexOf(words[i]);
            if (pos > -1) {
                patt = /\W/g;
                if (txt.substr(pos + words[i].length, 1).match(patt) && txt.substr(pos - 1, 1).match(patt)) {
                    if (pos > -1 && (rpos == -1 || pos < rpos)) {
                        rpos = pos;
                        rpos2 = rpos + words[i].length;
                    }
                }
            }
        }
        return [rpos, rpos2, func];
    }
    function getStatementPos(typ, txt, func) {
        var words, i, pos, rpos = -1, rpos2 = -1, patt;
        if (typ == "js") {
            words = ['if', 'elseif', 'else', 'for', 'while', 'return'];
        }
        for (i = 0; i < words.length; i++) {
            pos = txt.indexOf(words[i]);
            if (pos > -1) {
                patt = /\W/g;
                if (txt.substr(pos + words[i].length, 1).match(patt) && txt.substr(pos - 1, 1).match(patt)) {
                    if (pos > -1 && (rpos == -1 || pos < rpos)) {
                        rpos = pos;
                        rpos2 = rpos + words[i].length;
                    }
                }
            }
        }
        return [rpos, rpos2, func];
    }
    function getPos(txt, start, end, func) {
        var s, e;
        s = txt.search(start);
        e = txt.indexOf(end, s + (end.length));
        if (e == -1) { e = txt.length; }
        return [s, e + (end.length), func];
    }
    function getNumPos(txt, func) {
        var arr = ["<br>", " ", ";", "(", "+", ")", "[", "]", ",", "&", ":", "{", "}", "/", "-", "*", "|", "%", "="], i, j, c, startpos = 0, endpos, word;
        for (i = 0; i < txt.length; i++) {
            for (j = 0; j < arr.length; j++) {
                c = txt.substr(i, arr[j].length);
                if (c == arr[j]) {
                    if (c == "-" && (txt.substr(i - 1, 1) == "e" || txt.substr(i - 1, 1) == "E")) {
                        continue;
                    }
                    endpos = i;
                    if (startpos < endpos) {
                        word = txt.substring(startpos, endpos);
                        if (!isNaN(word)) { return [startpos, endpos, func]; }
                    }
                    i += arr[j].length;
                    startpos = i;
                    i -= 1;
                    break;
                }
            }
        }
        return [-1, -1, func];
    }
}