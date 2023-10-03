// バッジ数に応じたペナルティの閾値一覧
const penaltyThreshold = [25, 30, 35, 40, 45, 50, 55, 60, 100];

// 計算処理
function calcCatchRate() {
    // ポケモンの番号(配列のPK)を取得
    var pokemonNumber = Number(document.getElementById("pokemon").value);
    // ポケモンのレベルを取得
    var pokemonLevel = Number(document.getElementById("level").value);
    // ポケモンの現在のHPを取得
    var currentHp = Number(document.getElementById("hp").value);
    // 取得バッジ数に応じた、ペナルティ無しで捕まえられる上限レベルを取得
    var earnedBadges = Number(document.getElementById("badges").value);
    // 状態異常の有無を取得(文字列)
    var disease = document.getElementById("disease").value;
    // ほかくパワーの倍率を取得
    var additionalEffect = Number(document.getElementById("additionalEffect").value);
    // 不意打ちの有無を取得(エレメント)
    var surprise = document.getElementById("surprise");
    // 図鑑のポケモン数を取得
    var pokedex = Number(document.getElementById("pokedex").value);

    // ポケモンの最大HPを求める
    // HP = (種族値×2+個体値+努力値÷4)×レベル÷100+レベル+10
    // 種族値は配列の2次元目の4番にあるが、まずは1次元目でPK-1をしてインデックスを指定する
    var hiddenHpValue = Number(pokemonArray[pokemonNumber - 1][3]);
    var maxHp = Math.ceil((hiddenHpValue * 2 + 31 + 0 / 4) * pokemonLevel / 100) + pokemonLevel + 10;
    // A = (最大HP×3－現在HP×2)×4096×捕捉率×捕獲補正率(モンボ想定で1)
    // 捕捉率は種族値と同じように配列から取ってくる
    var variableA = (maxHp * 3 - currentHp * 2) * 4096 * Number(pokemonArray[pokemonNumber - 1][2]) * 1;
    // ペナルティ閾値オーバーの数をカウントする変数
    var penaltyThresholdExceededCounter = 0;
    // ペナルティ無しの上限レベルよりもポケモンのレベルが高い場合
    if (pokemonLevel > earnedBadges) {
        // ポケモンのレベルと閾値を比較して、超えるか等しい時にループを抜ける
        for(counterI = 0; pokemonLevel <= penaltyThreshold[counterI]; counterI++) {
            // 現在のバッジ数に応じた閾値と、配列の閾値を比較し、バッジが足りていない時はインクリメント
            if (earnedBadges < penaltyThreshold[counterI]) {
                penaltyThresholdExceededCounter++;
            }
        }
        // このままだと閾値が一段階低い状態なのでプラス1する
        penaltyThresholdExceededCounter++;
    }
    // (続きから)A = ×0.8バッジ不足数(累乗)
    // X ** Y で XのY乗を表現することが出来る
    if (penaltyThresholdExceededCounter > 0) {
        variableA = variableA * (0.8 ** penaltyThresholdExceededCounter);
    }

    // B = (A÷(最大HP×3))×レベル補正
    // レベル補正の処理はポケモンのレベルが13以下の時のみ
    // 14～の時は1をかける = そのため初期値を1とする
    var levelCorrection = 1;
    if (13 >= pokemonLevel) {
        // レベル補正 = (36 - 2×野生ポケモンのレベル) / 10
        levelCorrection = (36 - (2 * pokemonLevel)) / 10;
        // 小数点切り捨て
        levelCorrection = Math.floor(levelCorrection);
    }
    // 前述のBを求める
    var variableB = (variableA / (maxHp * 3)) * levelCorrection;
    variableB = Math.floor(variableB);

    // C = B×状態異常補正
    // 状態異常補正はどく・まひ・やけどなら1.5、ねむり・こおりなら2.5となる
    // また、計算後は四捨五入を行う
    var variableC = 0;
    switch(disease) {
        case 'nope':
            variableC = variableB;
            break;
        case 'minorDisease':
            variableC = variableB * 1.5;
            variableC = Math.round(variableC);
            break;
        case 'severeDisease':
            variableC = variableB * 2.5;
            variableC = Math.round(variableC);
            break;
    }

    // D = C×ほかくパワー補正×不意打ち補正
    // 不意打ち補正は無い場合が1で、ある場合が2となる
    var surpriseCorrection = 1;
    if (surprise.checked) {
        surpriseCorrection = 2;
    }
    // Dを求める
    var variableD = variableC * additionalEffect * surpriseCorrection;
    // 四捨五入
    variableD = Math.round(variableD);
    // 1044480より大きい場合は1044480とする
    if (variableD > 1044480) {
        variableD = 1044480;
    }

    // 最終的な捕獲率を入れる用の変数
    var resultCatchRate = 0;
    resultCatchRate = variableD;

    // このままでは桁が大きすぎるので、従来の倍率に近づける
    // 倍率をかけた後に2048を足し、4096で割り、小数点後を切り捨てる
    resultCatchRate = resultCatchRate + 2048;
    resultCatchRate = Math.floor(resultCatchRate / 4096);

    // 結果を画面に表示
    var calcCatchRateBlock = document.getElementById("selectAndGen");
    var inputResultCatchRate = document.getElementById("resultCatchRate");
    // まだ結果表示用タグが画面にない場合
    if (typeof inputResultCatchRate === 'undefined' || inputResultCatchRate == null) {
        // 結果表示用のinput属性を作り、親子関係をセットする
        var inputResultCatchRate = document.createElement("input");
        inputResultCatchRate.setAttribute("type", "text");
        inputResultCatchRate.setAttribute("id", "resultCatchRate");
        inputResultCatchRate.setAttribute("name", "resultCatchRate");
        inputResultCatchRate.setAttribute("value", "捕獲率は" + resultCatchRate + "%！");
        inputResultCatchRate.readOnly = true;
        calcCatchRateBlock.appendChild(inputResultCatchRate);
    } else {
        inputResultCatchRate.setAttribute("value", "捕獲率は" + resultCatchRate + "%！");
    }

    /*
    // E = 715827883×つかまえたかず倍率×D÷(4294967296×4096)
    // 図鑑がどれだけ埋まっているかに応じて倍率を設定
    var pokedexCorrection = 1;
    if (pokedex < 31) {
        pokedexCorrection = 0;
    } else if (pokedex < 151) {
        pokedexCorrection = 0.5;
    } else if (pokedex < 301) {
        pokedexCorrection = 1;
    } else if (pokedex < 451) {
        pokedexCorrection = 1.5;
    } else if (pokedex < 601) {
        pokedexCorrection = 2;
    } else if (pokedex > 600) {
        pokedexCorrection = 2.5;
    }
    // Eを求める
    var variableE = 715827883 * pokedexCorrection * variableD / (4294967296 * 4096);
    */
}

// // タブが選択された際の処理
function SelectCalcCatchRate() {
    // すべての親となるdivを取得
    var selectAndGenCalcCatchRate = document.getElementById("selectAndGen");
    // 2回目以降は子要素を削除してから追加する必要がある
    // 子要素がある限り、一番目の子要素を削除
    while(selectAndGenCalcCatchRate.firstChild){
        selectAndGenCalcCatchRate.removeChild(selectAndGenCalcCatchRate.firstChild);
    }

    // 部品をどんどん生成していく
    // 親の親　先祖様
    var form  = document.createElement("form");
    selectAndGenCalcCatchRate.appendChild(form);

    // 横並び用div
    var div1 = document.createElement("div");
    div1.setAttribute("class", "displayFlexArea dfArea1");
    form.appendChild(div1);

    // 1つ1つの要素を分けるdiv
    var childDiv1 = document.createElement("div");
    div1.appendChild(childDiv1);

    // ポケモン名
    var label1 = document.createElement("label");
    label1.textContent = "ポケモンを選んでね";
    childDiv1.appendChild(label1);
    var selectPokemonName = document.createElement("select");
    selectPokemonName.setAttribute("id", "pokemon");
    selectPokemonName.setAttribute("class", "pokemonSelect");
    childDiv1.appendChild(selectPokemonName);
    // ポケモンの数ぶんループ
    pokemonArray.forEach(function(aryValue,aryIndex) {
        var optionPokemonSelect = document.createElement("option");
        optionPokemonSelect.text = aryValue[1];
        optionPokemonSelect.setAttribute("value", aryValue[0]);
        selectPokemonName.appendChild(optionPokemonSelect);
    });

    // セレクトボックスに検索機能を付与する
    $(selectPokemonName).select2({
        language: "ja",
        width: 'auto',
        dropdownAutoWidth: true,
    });
  

    // 1つ1つの要素を分けるdiv
    var childDiv2 = document.createElement("div");
    div1.appendChild(childDiv2);

    // レベル
    var label2 = document.createElement("label");
    label2.textContent = "レベル";
    childDiv2.appendChild(label2);
    var pokeLevelInput = document.createElement("input");
    pokeLevelInput.setAttribute("type", "number");
    pokeLevelInput.setAttribute("id", "level");
    pokeLevelInput.setAttribute("name", "level");
    pokeLevelInput.setAttribute("min", 1);
    pokeLevelInput.setAttribute("max", 100);
    pokeLevelInput.setAttribute("value", 50);
    pokeLevelInput.required = true;
    childDiv2.appendChild(pokeLevelInput);

    // ここからHPゲージ
    // 1つ1つの要素を分けるdiv
    var childDiv3 = document.createElement("div");
    childDiv3.setAttribute("class", "range-container");
    div1.appendChild(childDiv3);
    var childInChildDiv1 = document.createElement("div");
    childInChildDiv1.setAttribute("class", "slider-container");
    childDiv3.appendChild(childInChildDiv1);
    var rangeFill = document.createElement("div");
    rangeFill.setAttribute("class", "range-fill");
    childInChildDiv1.appendChild(rangeFill);
    var childP1 = document.createElement("p");
    childP1.textContent = "今のだいたいのHPは？";
    childInChildDiv1.appendChild(childP1);
    var range1 = document.createElement("input");
    range1.setAttribute("type", "range");
    range1.setAttribute("class", "slider");
    range1.setAttribute("id", "hp");
    range1.setAttribute("name", "hp");
    range1.setAttribute("min", 1);
    range1.setAttribute("max", 100);
    range1.setAttribute("value", 100);
    range1.setAttribute("list", "markers");
    childInChildDiv1.appendChild(range1);
    var datalist = document.createElement("datalist");
    datalist.setAttribute("id", "markers");
    childInChildDiv1.appendChild(datalist);
    var optionMarkers1 = document.createElement("option");
    optionMarkers1.setAttribute("value", 1);
    optionMarkers1.setAttribute("label", "1");
    datalist.appendChild(optionMarkers1);
    var optionMarkers2 = document.createElement("option");
    optionMarkers2.setAttribute("value", 25);
    optionMarkers2.setAttribute("label", "25");
    datalist.appendChild(optionMarkers2);
    var optionMarkers3 = document.createElement("option");
    optionMarkers3.setAttribute("value", 50);
    optionMarkers3.setAttribute("label", "50");
    datalist.appendChild(optionMarkers3);
    var optionMarkers4 = document.createElement("option");
    optionMarkers4.setAttribute("value", 75);
    optionMarkers4.setAttribute("label", "75");
    datalist.appendChild(optionMarkers4);
    var optionMarkers5 = document.createElement("option");
    optionMarkers5.setAttribute("value", 100);
    optionMarkers5.setAttribute("label", "100");
    datalist.appendChild(optionMarkers5);
    var childInChildDiv2 = document.createElement("div");
    childInChildDiv2.setAttribute("class", "label-container");
    childDiv3.appendChild(childInChildDiv2);
    var labelContaLabel1 = document.createElement("label");
    labelContaLabel1.setAttribute("class", "label fixedPositionLabel1");
    labelContaLabel1.textContent = "1";
    childInChildDiv2.appendChild(labelContaLabel1);
    var labelContaLabel2 = document.createElement("label");
    labelContaLabel2.setAttribute("class", "label fixedPositionLabel25");
    labelContaLabel2.textContent = "25";
    childInChildDiv2.appendChild(labelContaLabel2);
    var labelContaLabel3 = document.createElement("label");
    labelContaLabel3.setAttribute("class", "label fixedPositionLabel50");
    labelContaLabel3.textContent = "50";
    childInChildDiv2.appendChild(labelContaLabel3);
    var labelContaLabel4 = document.createElement("label");
    labelContaLabel4.setAttribute("class", "label fixedPositionLabel75");
    labelContaLabel4.textContent = "75";
    childInChildDiv2.appendChild(labelContaLabel4);
    var labelContaLabel5 = document.createElement("label");
    labelContaLabel5.setAttribute("class", "label");
    labelContaLabel5.textContent = "100";
    childInChildDiv2.appendChild(labelContaLabel5);

    // 横並び用div
    var div2 = document.createElement("div");
    div2.setAttribute("class", "displayFlexArea dfArea2");
    form.appendChild(div2);

    // 1つ1つの要素を分けるdiv
    var childDiv4 = document.createElement("div");
    div2.appendChild(childDiv4);
    // バッジの数
    var label3 = document.createElement("label");
    label3.textContent = "バッジの数は？";
    childDiv4.appendChild(label3);
    var selectBadges = document.createElement("select");
    selectBadges.setAttribute("id", "badges");
    selectBadges.setAttribute("name", "badges");
    childDiv4.appendChild(selectBadges);
    var optionBadges1 = document.createElement("option");
    optionBadges1.text = "0";
    optionBadges1.setAttribute("value", 25);
    selectBadges.appendChild(optionBadges1);
    var optionBadges2 = document.createElement("option");
    optionBadges2.text = "1";
    optionBadges2.setAttribute("value", 30);
    selectBadges.appendChild(optionBadges2);
    var optionBadges3 = document.createElement("option");
    optionBadges3.text = "2";
    optionBadges3.setAttribute("value", 35);
    selectBadges.appendChild(optionBadges3);
    var optionBadges4 = document.createElement("option");
    optionBadges4.text = "3";
    optionBadges4.setAttribute("value", 40);
    selectBadges.appendChild(optionBadges4);
    var optionBadges5 = document.createElement("option");
    optionBadges5.text = "4";
    optionBadges5.setAttribute("value", 45);
    selectBadges.appendChild(optionBadges5);
    var optionBadges6 = document.createElement("option");
    optionBadges6.text = "5";
    optionBadges6.setAttribute("value", 50);
    selectBadges.appendChild(optionBadges6);
    var optionBadges7 = document.createElement("option");
    optionBadges7.text = "6";
    optionBadges7.setAttribute("value", 55);
    selectBadges.appendChild(optionBadges7);
    var optionBadges8 = document.createElement("option");
    optionBadges8.text = "7";
    optionBadges8.setAttribute("value", 60);
    selectBadges.appendChild(optionBadges8);
    var optionBadges9 = document.createElement("option");
    optionBadges9.text = "8";
    optionBadges9.setAttribute("value", 100);
    optionBadges9.selected = true;
    selectBadges.appendChild(optionBadges9);

    // 1つ1つの要素を分けるdiv
    var childDiv5 = document.createElement("div");
    div2.appendChild(childDiv5);
    // 状態異常
    var label4 = document.createElement("label");
    label4.textContent = "状態異常にした？";
    childDiv5.appendChild(label4);
    var selectDisease = document.createElement("select");
    selectDisease.setAttribute("id", "disease");
    selectDisease.setAttribute("name", "disease");
    childDiv5.appendChild(selectDisease);
    var optionDisease1 = document.createElement("option");
    optionDisease1.text = "なし";
    optionDisease1.setAttribute("value", "nope");
    optionDisease1.selected = true;
    selectDisease.appendChild(optionDisease1);
    var optionDisease2 = document.createElement("option");
    optionDisease2.text = "どく・まひ・やけど";
    optionDisease2.setAttribute("value", "minorDisease");
    selectDisease.appendChild(optionDisease2);
    var optionDisease3 = document.createElement("option");
    optionDisease3.text = "ねむり・こおり";
    optionDisease3.setAttribute("value", "severeDisease");
    selectDisease.appendChild(optionDisease3);

    // 横並び用div
    var div3 = document.createElement("div");
    div3.setAttribute("class", "displayFlexArea dfArea2");
    form.appendChild(div3);

    // 1つ1つの要素を分けるdiv
    var childDiv6 = document.createElement("div");
    div3.appendChild(childDiv6);
    // ほかくパワー
    var label5 = document.createElement("label");
    label5.textContent = "ほかくパワーはある？";
    childDiv6.appendChild(label5);
    var selectAdditionalEffect = document.createElement("select");
    selectAdditionalEffect.setAttribute("id", "additionalEffect");
    selectAdditionalEffect.setAttribute("name", "additionalEffect");
    childDiv6.appendChild(selectAdditionalEffect);
    var optionAdditionalEffect1 = document.createElement("option");
    optionAdditionalEffect1.text = "なし";
    optionAdditionalEffect1.setAttribute("value", 1);
    selectAdditionalEffect.appendChild(optionAdditionalEffect1);
    var optionAdditionalEffect2 = document.createElement("option");
    optionAdditionalEffect2.text = "Lv.1発動中";
    optionAdditionalEffect2.setAttribute("value", 1.1);
    selectAdditionalEffect.appendChild(optionAdditionalEffect2);
    var optionAdditionalEffect3 = document.createElement("option");
    optionAdditionalEffect3.text = "Lv.2発動中";
    optionAdditionalEffect3.setAttribute("value", 1.25);
    selectAdditionalEffect.appendChild(optionAdditionalEffect3);
    var optionAdditionalEffect4 = document.createElement("option");
    optionAdditionalEffect4.text = "Lv.3発動中";
    optionAdditionalEffect4.setAttribute("value", 2);
    selectAdditionalEffect.appendChild(optionAdditionalEffect4);

    // 1つ1つの要素を分けるdiv
    var childDiv7 = document.createElement("div");
    div3.appendChild(childDiv7);
    // 不意
    var label6 = document.createElement("label");
    label6.textContent = "不意をついた？";
    childDiv7.appendChild(label6);
    var checkboxInput = document.createElement("input");
    checkboxInput.setAttribute("type", "checkbox");
    checkboxInput.setAttribute("id", "surprise");
    checkboxInput.setAttribute("name", "surprise");
    childDiv7.appendChild(checkboxInput);

    // 1つ1つの要素を分けるdiv
    var childDiv8 = document.createElement("div");
    div3.appendChild(childDiv8);
    // 捕まえた数
    var label7 = document.createElement("label");
    label7.textContent = "図鑑の捕まえた数は？";
    childDiv8.appendChild(label7);
    var pokedexInput = document.createElement("input");
    pokedexInput.setAttribute("type", "number");
    pokedexInput.setAttribute("id", "pokedex");
    pokedexInput.setAttribute("name", "pokedex");
    pokedexInput.setAttribute("min", 0);
    pokedexInput.setAttribute("max", 400);
    pokedexInput.setAttribute("value", 400);
    pokedexInput.required = true;
    childDiv8.appendChild(pokedexInput);

    // 計算開始のボタンを作成
    var calcBtnPokemon = document.createElement("button");
    calcBtnPokemon.setAttribute("type", "button");
    calcBtnPokemon.setAttribute("class", "blueBtn");
    calcBtnPokemon.setAttribute("onclick", "calcCatchRate();");
    calcBtnPokemon.textContent = "計算開始";
    selectAndGenCalcCatchRate.appendChild(calcBtnPokemon);
}