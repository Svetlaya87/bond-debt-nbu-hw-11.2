let dateRateNBU=new Date().toLocaleDateString().split('.').reverse().join('');
console.log(dateRateNBU);


const URL1 = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/ovdp?json';
const URL2= `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${dateRateNBU}&json`

const appConfig = {
    data(){
        return {
            title:'Долг Украины по облигациям за все время',
            rates: [],
            sumChekedInputs:0,
            allDebts: 0
            
            
        }
    },
    computed: {// компъютед - это раздел, внутри которого есть методы, т.е функции. Эти функции будут вызываться при изменении модели данных
       

    },
    methods:{
        somethingHappens(chekedInputs){
            chekedInputs = document.getElementsByTagName('input');
           // cheked = input.classList.contains("form-check-input:checked");
           let sumCheked = 0;
           for(let i=0; i<chekedInputs.length; i++){
               if ( chekedInputs[i].checked==true ){
                   sumCheked = sumCheked + this.rates[i].sum;

               }
               
            }
           
           //console.log(chekedInputs);
           //console.log(sumCheked);
           this.sumChekedInputs = sumCheked.toLocaleString('Ru-ru', {minimumFractionDigits: 2, maximumFractionDigits: 2});

        },
        selectAllYears(chekedInputs){

            chekedInputs = document.getElementsByTagName('input');
            let sumCheked = 0;
            let button = document.getElementsByTagName('button');
            
            if (button[0]._value == 0){
                for(let i=0; i<chekedInputs.length; i++){
                    chekedInputs[i].checked = true;
                    sumCheked = sumCheked + this.rates[i].sum;
      
                }

                button[0]._value = 1;
            }else{
                for(let i=0; i<chekedInputs.length; i++){
                    chekedInputs[i].checked = false;
                 
                }
                
                button[0]._value = 0;

            }
            sumCheked = sumCheked.toLocaleString("Ru-ru", {minimumFractionDigits: 2, maximumFractionDigits: 2});
            this.sumChekedInputs = `${sumCheked}`;

            /*
            https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
            minimumFractionDigits
            Минимальное используемое количество цифр дробной части числа. Возможными значениями являются значения от 0 до 20; значением по умолчанию для простого и процентного форматирования является 0; значением по умолчанию для форматирования валюты является число цифр младших единиц, определяемое в списке кодов валют ISO 4217 (2, если данный список не предоставляет такой информации).
            */
            
            
            //console.log(button);
           //console.log(chekedInputs);


           //console.log(sumCheked);

           /*
           Код, который форматирует числ 10000000000,00000 в 10 000 000 000, 00 грн
           sumCheked  = ('' + sumCheked.toFixed(2) ).split('.');
           console.log(sumCheked);
           sumCheked = sumCheked.map(a => a*1);
           console.log(sumCheked);
         
           let sumProbel=[];
        
           for (let i = 1; sumCheked[0] >= 1000; i++ ){
               
               sumProbel.unshift(sumCheked[0]%1000);
               sumCheked[0] = Math.trunc(sumCheked[0]/1000);
            
           }
           
           sumProbel.unshift(sumCheked[0]);
           sumProbel = sumProbel.join(' ');
           sumCheked[0] = sumProbel;
           
           sumCheked = sumCheked.join(', ');

           */
           



        
           

           

           

        }

    },
    async mounted(){
        let res = await fetch(URL1);
        let res2 = await fetch(URL2);
            res = await res.json();
            res2= await res2.json();
            let USDrate, EURrate;

   // оставляем в массиве валют только доллары и евро
                for (i=0; i< res2.length; i++){

                    if(res2[i].cc == "USD" ){
                        USDrate=res2[i];
                    }else if(res2[i].cc == "EUR"){
                        EURrate=res2[i];
                        
                    }
                }

           
// преобразуем долларовую / евро сумму в грн
            for(let i = 0; i<res.length; i++){
                if(res[i].valcode == "USD"){
                    res[i].attraction =  res[i].attraction * USDrate;
                    
                } else if (res[i].valcode == "EUR"){
                    res[i].attraction =  res[i].attraction * EURrate;
                }

                res[i].valcode = "UAH";
            }

         

        //res = res.map(item => ({...item, qt: 0}) );//вставляем старые значения объекта и добавляем поле qt: 0
        res = res.filter(a => a.attraction > 0);
        
        
        res = res.map(item => ({
            sum: item.attraction,
            paydate: item.paydate,
            repayyear: new Date (item.repaydate.split('.').reverse().join('-') ).getFullYear(),
            val: item.valcode
        })
        );

        console.log(res);

        let sortedRes = res.slice().sort( (a,b) => b.repayyear - a.repayyear);
        console.log(sortedRes);
        let yearSum=0;
        let yearRes=[];
        this.allDebts = [...sortedRes]
        .reduce(
            (sum, item) => sum + item.sum, 0)
        .toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2});

       for (let i=0; i< sortedRes.length-1; i++){
            let currYear = sortedRes[i].repayyear;
            let currYearNexti = sortedRes[i+1].repayyear;
            
          
            
            if(currYear == currYearNexti){
                yearSum  = yearSum+sortedRes[i].sum;

                if (i == sortedRes.length-2){
                    yearSum  = yearSum  + sortedRes[i+1].sum;
                    yearRes.push({sum: yearSum, repayYear: currYear, val: sortedRes[i+1].val });

                }
            }else{

                yearSum  =  yearSum+sortedRes[i].sum;
                yearRes.push({sum: yearSum, repayYear: currYear, val: sortedRes[i].val });

                yearSum = 0;

                if (i == sortedRes.length-2){
                    yearSum  =  sortedRes[i+1].sum;
                    yearRes.push({sum: yearSum, repayYear: currYear, val: sortedRes[i+1].val, chekType: false });

                }

            }
        }

        console.log( 
            yearRes.reduce(
                (sum, item) => sum + item.sum, 0  ) 
            - sortedRes.reduce(
                (sum, item) => sum + item.sum, 0) 
            );
        console.log( 
            yearRes.reduce((sum, item) => sum + item.sum, 0  ) , sortedRes.reduce((sum, item) => sum + item.sum, 0) );

            // преобразовываю число из 1000000,000 в 1 000 000,00

        
            console.log(yearRes);
        
        
        
        
        this.rates = yearRes;
        
        console.log( this.rates);
        

       

        
        


    }
}

const app = Vue.createApp(appConfig);
app.component('one-year',{ // по идее мы должны уведомлять родителя, если qt изменилось в дочернем компоненте о его изменении, но Vue сам это отслеживает (назвается реактивность) через rates в data в родит. компоненте. Но реактивновсть работает только на 2 уровня вложенности, т.е следит за массивом rates и его компонентами, если внутри компонентов еще объекты лежат и массивы, то там уже не отслеживается
    props:['yearData', 'callParent'],
    template:`

    <div class="input-group justify-content-sm-center justify-content-md-center justify-content-lg-center ">
        <div class="input-group-text mx-2">
            <input  @click='callParent(yearData)' class="form-check-input mt-0 " type="checkbox" value=''   aria-label="Checkbox for following text input">
            
        </div>

        <span class='mx-2'>Год </span>
        <b class='mx-2'> {{yearData.repayYear}} </b>
        <span class='mx-2'>Долг для выплат</span> 
        <b class='mx-2 text-end' style="width: 150px;">{{ yearData.sum.toLocaleString('Ru-ru', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }} </b> грн.
        
    </div>
    `
});
// механизм реактивности- отслеживание изменений данных в модели, так же и компютеды пересчитывают формулы, когда в модели что-то меняется
// если был бы в массиве еще один уровень вложенности, то пришлось бы при изменении в дочернем элементе сообщать об изменении родителю
app.mount('#app');



/*

    let res2 = await fetch(URL2);
    res2= await res2.json();

    let ccyrates = {};
    for (i=0; i< res2.length; i++) {
        ccyrates[ res2[i].cc ] = res2[i].rate;
    }
    // result: ccyrates['USD'], ccyrates['EUR'], ...
    // result: ccyrates.USD, ccyrates.EUR, ...

    let USDrate, EURrate;
    for (i=0; i< res2.length; i++) {
        if (res2[i].cc == "USD") {
            USDrate = res2[i].rate;
        } else if (res2[i].cc == "EUR") {
            EURrate = res2[i].rate;
        }
    }
    // result: USDrate, EURrate



    let res = await fetch(URL1);
    res = await res.json();

    // вариант 1 (объект): преобразуем долларовую / евро сумму в грн
    ccyrates['UAH'] = 1;
    for(let i = 0; i < res.length; i++) {
        res[i].attraction = res[i].attraction * ccyrates[ res[i].valcode ];
    }

    // вариант 2 (2 переменные): преобразуем долларовую / евро сумму в грн
    for(let i = 0; i<res.length; i++){
        if(res[i].valcode == "USD"){
            res[i].attraction =  res[i].attraction * USDrate;
        } else if (res[i].valcode == "EUR"){
            res[i].attraction =  res[i].attraction * EURrate;
        }
    }

    res = res.filter(a => a.attraction > 0);

    res = res.map(item => ({
                sum: item.attraction,
                paydate: item.paydate,
                repayyear: new Date (item.repaydate.split('.').reverse().join('-') ).getFullYear(),
            })
    );

    let repay_per_year = {};
    for( let item of res )
    {
        if( item.repayyear === undefined ) {
            repay_per_year[item.repayyear] = 0;
        }
        repay_per_year[item.repayyear] = repay_per_year[item.repayyear] + item.sum;
    }
    // result: repay_per_year['2002'], repay_per_year['2003'], repay_per_year['2004']...

    this.rates = Object.entries(repay_per_year).map( ([key,value]) => ({sum: value, repayYear: key}) );




    let sortedRes = res.slice().sort( (a,b) => b.repaydate - a.repaydate);
    // преобразование моего цикла в более короткий. Мы заранее присвоили 0-й по индексу элемент. Здесь сравнивается переменная с Текущим элементом, если оно отличается , то присваеваем переменной новое "текущее" значение
    let currYear = sortedRes[0].repayyear;
    let currYearSum = sortedRes[0].sum;

    let yearRes = [];
    for (let i = 1; i < sortedRes.length; i++) {
        if( currYear == sortedRes[i].repayyear ) {
            currYearSum += sortedRes[i].sum;
        } else {
            yearRes.push({sum: currYearSum, repayYear: currYear });
            currYear = sortedRes[i].repayyear;
            currYearSum = sortedRes[i].sum;
        }
    }
    yearRes.push({sum: yearSum, repayYear: currYear });

    //


    let sortedRes = res.slice().sort( (a,b) => b.repaydate - a.repaydate);
    let yearSum=0;
    let yearRes=[];

        for (let i=0; i< sortedRes.length-1; i++){
            let currYear = sortedRes[i].repaydate.getFullYear();
            let currYearNexti = sortedRes[i+1].repaydate.getFullYear();
            
            if(currYear == currYearNexti){
                yearSum  = yearSum+sortedRes[i].sum;

                if (i == sortedRes.length-2){
                    yearSum  = yearSum  + sortedRes[i+1].sum;
                    yearRes.push({sum: yearSum, repayYear: currYear });
                }
            }else{
                yearSum  =  yearSum+sortedRes[i].sum;
                yearRes.push({sum: yearSum, repayYear: currYear });
                yearSum = 0;

                if (i == sortedRes.length-2){
                    yearSum  =  sortedRes[i+1].sum;
                    yearRes.push({sum: yearSum, repayYear: currYear });
                }

            }
        }

    this.rates = yearRes;


*/