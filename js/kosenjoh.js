// 古戦場の行を追加する度にインクリメントし、idに利用する
let createCountKosenjoh = 0;

// タブが選択された際の処理
function SelectKosenjoh() {
    // すべての親となるdivを取得
    var selectAndGenKosenjoh = document.getElementById("selectAndGen");
    // 2回目以降は子要素を削除してから追加する必要がある
    // 子要素がある限り、一番目の子要素を削除
    while(selectAndGenKosenjoh.firstChild){
        selectAndGenKosenjoh.removeChild(selectAndGenKosenjoh.firstChild);
    }

    // 部品をどんどん生成していく
    var h2 = document.createElement("h2");
    h2.textContent = "古戦場 貢献度効率計算機";
    selectAndGenKosenjoh.appendChild(h2);

    var br = document.createElement("br");
    selectAndGenKosenjoh.appendChild(br);

    var p1 = document.createElement("p");
    p1.textContent = "何秒かかったかを赤い欄に入力してください";
    var p2 = document.createElement("p");
    p2.textContent = "結果は時速で表示します";
    selectAndGenKosenjoh.appendChild(p1);
    selectAndGenKosenjoh.appendChild(p2);

    var div1 = document.createElement("div");
    div1.setAttribute("id", "kosenjohBlock");
    selectAndGenKosenjoh.appendChild(div1);

    // ボタン系
    var genNewRowBtn = document.createElement("button");
    genNewRowBtn.setAttribute("type", "button");
    genNewRowBtn.setAttribute("class", "blueBtn");
    genNewRowBtn.setAttribute("onclick", "GenerateNewRowKosenjoh();");
    genNewRowBtn.textContent = "項目を追加する";
    selectAndGenKosenjoh.appendChild(genNewRowBtn);
    var calcBtnKosenjoh = document.createElement("button");
    calcBtnKosenjoh.setAttribute("type", "button");
    calcBtnKosenjoh.setAttribute("class", "blueBtn");
    calcBtnKosenjoh.setAttribute("onclick", "CalcAndDisp();");
    calcBtnKosenjoh.textContent = "時速を計算する";
    selectAndGenKosenjoh.appendChild(calcBtnKosenjoh);

    // グラフ描画用
    var div2 = document.createElement("div");
    div2.setAttribute("id", "graph");
    selectAndGenKosenjoh.appendChild(div2);

    // ここからは行追加と一緒
    GenerateNewRowKosenjoh();
}

// 行追加のボタンを押した時の処理
function GenerateNewRowKosenjoh() {
    // 親となるdiv属性をget
    var kosenjohBlock = document.getElementById("kosenjohBlock");
    // from属性を作成し、idを付与する
    var form = document.createElement("form");
    form.setAttribute("id", createCountKosenjoh);
    // 数字を入力するためのinput属性を作成し、typeを設定する
    var inputNumber = document.createElement("input");
    inputNumber.setAttribute("type", "number");
    inputNumber.setAttribute("name", "number");
    inputNumber.setAttribute("class", "inputArea");
    inputNumber.required = true;
    // select属性を作成し、nameを設定する
    var select = document.createElement("select");
    select.setAttribute("name", "level");
    // ここまでの属性たちを親子関係にする
    kosenjohBlock.appendChild(form);
    form.appendChild(inputNumber);
    form.appendChild(select);
    // プルダウンリスト用の配列を2つ作成する
    // 2023/11 グラフ追加時のアプデにより、2つ作る意味は無くなりました…
    // text用(実際に表示される方)
    const optionTextArray = ['EX' , 'EX+' , '90 HELL' , '95 HELL' , '100 HELL' , '150 HELL' , '200 HELL'];
    // value用
    const optionValueArray = ['EX' , 'EX+' , '90 HELL' , '95 HELL' , '100 HELL' , '150 HELL' , '200 HELL'];
    // for文でループしながら作成と値の設定、親子セットを行う
    for(i = 0; i < 7; i++) {
        var option = document.createElement("option");
        option.text = optionTextArray[i];
        //option.setAttribute("textContent", optionTextArray[i]);
        option.setAttribute("value", optionValueArray[i]);
        select.appendChild(option);
    }
    // 結果表示用のinput属性を作成し、値を設定する
    var inputReadOnly = document.createElement("input");
    inputReadOnly.setAttribute("type", "text");
    inputReadOnly.setAttribute("name", "result");
    inputReadOnly.setAttribute("class", "inputArea resultArea");
    inputReadOnly.setAttribute("value", "時速：");
    inputReadOnly.readOnly = true;
    form.appendChild(inputReadOnly);
    // カウンターをインクリメント
    createCountKosenjoh ++;
}

// 計算結果ボタンを押した時の処理
function CalcAndDisp() {
    // ドキュメント内の全てのform属性を取得して配列にする
    const formElements = document.forms;
    // 絶対起きることは無いが、念のためformが無い時の処理
    if(1 > formElements.length) {
        swal("計算に失敗しました", "行を追加してください", "error");
        return;
    }

    // グラフ用配列の作成
    var graphData = [];

    // 取得したformの数ぶんループ
    // 計算に失敗した行があればフラグを立てておく
    var alertFlag = false;
    for(i = 0; i < formElements.length; i++) {
        // 数字(秒数)を取得してくる もしnullならフラグを立てる
        var elementNumber = formElements[i].number.value;
        if(null == elementNumber) {
            alertFlag = true;
            continue; // 次のループへ移す
        } else if(0 == elementNumber) {
            alertFlag = true;
            continue; // 次のループへ移す
        }


        // 選択されているレベルを取得する
        var elementSelected = formElements[i].level.value;
        // レベルに応じた貢献度を入れるための変数
        var convertLevelToNumber = 0;
        // 表示用のテキストを入れる変数
        var resultNumber = 0;
        // 文言によって分岐して貢献度を代入する
        switch(elementSelected) {
            case 'EX':
                convertLevelToNumber = 51000;
                break;
            case 'EX+':
                convertLevelToNumber = 88000;
                break;
            case '90 HELL':
                convertLevelToNumber = 260000;
                break;
            case '95 HELL':
                convertLevelToNumber = 910000;
                break;
            case '100 HELL':
                convertLevelToNumber = 2680000;
                break;
            case '150 HELL':
                convertLevelToNumber = 4100000;
                break;
            case '200 HELL':
                convertLevelToNumber = 13400000;
                break;
        }
        // 時速の計算を行う
        resultNumber = 3600 / elementNumber * convertLevelToNumber;
        // 小数点以下で四捨五入した値に単位を付け、input属性のvalueにセットする
        formElements[i].result.value = yenFormat(resultNumber.toFixed(0));
        // グラフ用配列に値を入れる
        graphData.push([formElements[i].level.value + ' / ' + formElements[i].number.value + '秒', resultNumber.toFixed(0)]);
    }
    // グラフの描画
    displayGraph(graphData);

    // もしループ中にフラグが立っていたらアラートを表示する
    if(alertFlag == true) {
        swal("一部行で計算に失敗しました", "数字を入力しているか確認してください", "error");
    }
}

// ネットで見つけた、数字に単位を付けるやつ
function yenFormat(changeValue){
    const valutToString = String(changeValue);
    const stringLength = valutToString.length;
    const digits = ['', '万', '億', '兆', '京', '垓'];
    let resultWord = '';
    let resultWords = [];
    
    for(j = 0; j < Math.ceil(stringLength / 4); j++){
        resultWords[j] = Number(valutToString.substring(stringLength - j * 4, stringLength - (j + 1) * 4));
      if(resultWords[j] != 0) resultWord = String(resultWords[j]).replace(/(\d)(?=(\d\d\d)+$)/g, '$1,') + digits[j] + resultWord;
    }
    return '時速：' + resultWord;
  }

// グラフ描画処理
function displayGraph(graphData){
    // グラフ描画用divの取得
    var graph = document.getElementById('graph');

    // 配列の再作成
    graphArray =[];
    for(i = 0; i < graphData.length; i++) {
        graphArray.push({label: graphData[i][0], y: parseInt(graphData[i][1], 10)});
    }

    var chart = new CanvasJS.Chart(graph, {
        animationEnabled: true,
        exportEnabled: true,
        theme: "light2", // "light1", "light2", "dark1", "dark2"
        title: {
            text: "貢献度効率"  //グラフタイトル
        },
        axisY: {
            includeZero: true
        },
        data: [{
            type: 'column',  //グラフの種類
            dataPoints: graphArray  //表示するデータ
        }]
    });
    chart.render();
}