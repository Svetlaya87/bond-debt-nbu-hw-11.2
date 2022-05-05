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
