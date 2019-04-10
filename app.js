//BUDGET CONTROLLER
var budgetController = (function() {
  //Expanse Data structure
  var Expanse = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expanse.prototype.calcPercentage = function(totalIncome){
   if(totalIncome >0){
    this.percentage = Math.round((this.value/totalIncome)*100);
   } else {
     this.percentage =-1;
   }
  };

  Expanse.prototype.getPercentage = function() {
    return this.percentage;
  };

  // Income Data structure
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  
  var calculateTotal = function (type) {
    var sum = 0;

    data.allItems[type].forEach(function(cur){
        sum += cur.value;
    });
    data.totals[type] =sum;
};

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    //Public Method
    addItem: function(type, des, val) {
      var newItem, ID;

      //create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      //Create new item based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expanse(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      //Push it into our data structure
      data.allItems[type].push(newItem);

      //Return the new element
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;
      //
      ids = data.allItems[type].map(function(current){
        return current.id;
      });

      index = ids.indexOf(id);

      if(index !== -1){
        data.allItems[type].splice(index, 1);
      }

    },

    calculateBudget : function() {
        //Calculate Total Income and Expense 
        calculateTotal('exp');
        calculateTotal('inc');

        //Calculate the budget : income - expenses
        data.budget = data.totals.inc - data.totals.exp;

        //Calculate the % of income that we spent
        if(data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        } else {
            data.percentage = -1;
        }
    },

    calculatePercentages: function() {

      data.allItems.exp.forEach(function(cur){
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function(){
      var allPerc= data.allItems.exp.map(function(cur){
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: function() {
        return {
            budget: data.budget,
            totalinc: data.totals.inc,
            totalexp: data.totals.exp,
            percentage: data.percentage
        };
    },
    testing: function() {
      console.log(data);
    }
  };
})();

//UI CONTROLLER
var UIController = (function() {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    conatiner: '.container',
    expensesPercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec;
    /*
    + or - before number
    exactli 2 decimal points
    coma separating the thosands
    */

    num =  Math.abs(num);
    num = num.toFixed(2); //puts 2 decimal to number

    numSplit = num.split('.');
    int = numSplit[0];
    if(int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
    }

    dec = numSplit[1];

    return(type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback) {
    for(var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, //Will be either Inc or Exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    addListItem: function(obj, type) {
      var html, newHtml, element;
      //Crete HTML string with place holder text

      if (type === "inc") {
        element = DOMstrings.incomeContainer;

        html = `<div class="item clearfix" id="inc-%id%">
          <div class="item__description">%description%</div>
          <div class="right clearfix">
              <div class="item__value">%value%</div>
              <div class="item__delete">
                  <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
              </div>
          </div>
      </div>`;
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;

        html = `<div class="item clearfix" id="exp-%id%">
          <div class="item__description">%description%</div>
          <div class="right clearfix">
              <div class="item__value">%value%</div>
              <div class="item__percentage">21%</div>
              <div class="item__delete">
                  <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
              </div>
          </div>
      </div>`;
      }
      //Replace Placeholder text with data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%",formatNumber( obj.value, type));

      //Insert the HTML into DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
        var fields, fieldsArr;
        fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

        fieldsArr = Array.prototype.slice.call(fields);
        
        fieldsArr.forEach(function (current, index, array){
            current.value = "";
        });
        fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp'; 
         document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type );
         document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalinc, 'inc');
         document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalexp, 'exp');
       if(obj.percentage > 0){
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
       } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
       }
    },

    displayPercentages: function(percentages) {

      var fields =  document.querySelectorAll(DOMstrings.expensesPercentageLabel);

      nodeListForEach(fields, function(current, index) {
        if(percentages[index] > 0) {
           current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    displayMonth: function() {
      var now, year, month,months;
      now = new Date();
      months = ['Jan', 'Feb','Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
      month = now.getMonth();
      
      year = now.getFullYear();

      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    changedType: function(){
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue
      );

      nodeListForEach(fields, function(cur) {
        cur.classList.toggle('red-focus');
      });
      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  };
})();

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UIContrl) {

  var setupEventlisteners = function() {
    var DOM = UIContrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.conatiner).addEventListener('click', ctrlDeleteItem);
     
    document.querySelector(DOM.inputType).addEventListener('change', UIContrl.changedType);
  };

  var updateBudget = function(){

    //1. Calculate the budget
    budgetCtrl.calculateBudget();

    //2. Return budget
    var budget = budgetCtrl.getBudget();

    //3. Display the budget on UI
    UIContrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    //1. calculate %
    budgetCtrl.calculatePercentages();

    //2. Read % from budget controller
    var percentages =  budgetCtrl.getPercentages();
    //3. Update the UI with new %

    UIContrl.displayPercentages(percentages);
    
  };

  var ctrlAddItem = function() {
    var input, newItem;
    //1. Get the feild input data
    input = UIContrl.getInput();

    if(input.description !== "" && !isNaN(input.value) && input.value >0) {

    //2. Add the item to budget controller
    newItem = budgetCtrl.addItem( input.type, input.description, input.value );

    //3. Add the item to Ui
    UIContrl.addListItem(newItem, input.type);

    //4, Clear the fields
    UIContrl.clearFields();

    //5. Calculate and Update budget
    updateBudget();

    //6. Calculate and Update %
    updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event) {
      var itemID, splitID, type, ID;

      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
     
      if(itemID) {

        splitID = itemID.split('-')
        type = splitID[0];
        ID = parseInt(splitID[1]);

        //1. Delete item from data srtucture
        budgetCtrl.deleteItem(type, ID);

        //2. Delete item from UI
        UIContrl.deleteListItem(itemID);

        //3. Update and show the new budget
        updateBudget();

        //4. Calculate and Update %
          updatePercentages();
      }

  };

  return {
    init: function() {
      console.log("App has Started");
      UIContrl.displayMonth();
      UIContrl.displayBudget({
            budget: 0,
            totalinc: 0,
            totalexp: 0,
            percentage: -1
        });
      setupEventlisteners();
    }
  };
})(budgetController, UIController);

controller.init();
