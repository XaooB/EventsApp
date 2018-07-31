const Events = {
  //initial values that will be added to the database after visiting  website and resetting current database state
  initialValues: [{
      title: 'FrontEnd Bootcamp 2018',
      location: 'Saturday at 6 pm, H15 Boutique Hotel, Warsaw',
      description: 'Meet us in Boutique Hotel next Saturday. We are going to talk about new trends of 2018'
    },
    {
      title: 'Up In Smoke Tour',
      location: 'Saturday at 5 pm, Mattress Firm Amphitheatre, 2050 Entertainment Cir, Chula Vista',
      description: 'Featured Eminem, Snoop Dog, Dr Dre and more! Best event of 2018'
    },
    {
      title: 'Art Show',
      location: 'Sunday at 11 am, Lincoln Street, London',
      description: 'Must come and see best art made by John Doe. #FREE ENTRY, #FREE MEAL'
    },
    {
      title: 'Open Day - Business Link Maraton',
      location: 'Maraton Business Center, Poznań',
      description: 'We have a good reason to make you visit us at MBC. We will meet and talk about business and economy'
    },
    {
      title: 'World Rowing Under 23',
      location: 'Malta, Poznań',
      description: 'For many years both the Greater Poland Rowing Foundation and FISA International Rowing Federation were loyal partners for the organization of international events'
    }],
  indexedDB: window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB,
  //db connection
  dbOpen: this.indexedDB.open('Events', 1),
  //container for recently added events
  container: document.querySelector('.recently-added .flex-wrapper'),
  //container for adding event and displaying searched by user
  modal: document.querySelector('#modal'),
  bindEvents: function() {
    //recently added events
    document.querySelectorAll('.popular__delete').forEach(item => {item.addEventListener('click', this.deleteEvent.bind(this))});
  },
  clearDOM: function() {
        this.container.innerHTML = '';
  },
  addEvents: function() {
    let db = this.dbOpen.result,
        tx = db.transaction('EventsStore', 'readwrite');
        store = tx.objectStore('EventsStore');

    //add all events to the db backward (from the newest to the oldest)
    for(i = this.initialValues.length-1; i >= 0; i--) {
      store.put({
        title: this.initialValues[i].title,
        location: this.initialValues[i].location,
        description: this.initialValues[i].description
      });
    }

  },
  addEventFromUser: function() {

  }.
  restoreDatabase: function() {
    let db = this.dbOpen.result,
        tx = db.transaction('EventsStore', 'readwrite');
        store = tx.objectStore('EventsStore');

        store.clear().onsuccess = () => {
          this.clearDOM();
          this.addEvents();
          this.loadDataToDOM();
        };
  },
  deleteEvent: function(e) {
    let db = this.dbOpen.result,
        tx = db.transaction('EventsStore', 'readwrite');
        store = tx.objectStore('EventsStore'),
        eventID = Number(e.target.parentElement.parentElement.getAttribute('data-id'));

        //delete event
        let deleteItem = store.delete(eventID);
        deleteItem.onsuccess = e => {
          this.clearDOM();
          this.loadDataToDOM();
        }

        deleteItem.onerror = e => {
          throw new Error(e);
        }
  },
  loadDataToDOM: function() {
    let db = this.dbOpen.result,
        tx = db.transaction('EventsStore', 'readwrite');
        store = tx.objectStore('EventsStore'),
        counter = 0,

        store.openCursor().onsuccess = e => {
          let cursor = e.target.result;
          if(cursor && counter++ < 4) {
            this.container.innerHTML += `<article class="popular__item" data-id='${cursor.key}'>
                          <figure class='article__image-wrapper'>
                            <img src="assets/images/ev1.jpg" alt="event name" class='article__image'>
                            <button class='button button--danger popular__delete'>⤫</button>
                          </figure>
                          <div class="article__wrapper article__info">
                            <div class="article__date">
                              <span class='article__day'>21</span>
                              <span class='article__month'>AUG</span>
                            </div>
                            <a href="#" class='article__link'>
                              <div class="article__content">
                                <header>
                                  <h4 class='article__title'>${cursor.value.title}</h4>
                                </header>
                                  <p class="article__summary">${cursor.value.location}</p>
                                  <p class='article__text'>${cursor.value.description}</p>
                              </div>
                            </a>
                          </div>
                      </article>`
               cursor.continue();
          } else {
            //if theres no events in container then display a message
            if(!this.container.innerHTML) return this.container.innerText = 'No events to display. You need to add one or restore data to initial values.';
            //bind all events inside container
            return this.bindEvents();
          }
      }
  },
  //initial funtion
  initial: function() {
    //binding DOM elementes
    let modal = document.querySelector('#nav-modal')
        addEventBtn = modal.querySelector('#add_event'),
        restoreDbBtn = modal.querySelector('#restore_database');

    return () => {
      this.dbOpen.onupgradeneeded = e => {
        let db = this.dbOpen.result,
            store = db.createObjectStore('EventsStore', {
              autoIncrement: true
            });
            store.createIndex('title', 'title', {unique: false});
            store.createIndex('location', 'location', {unique: false});
            store.createIndex('description', 'description', {unique: false});
      };

      this.dbOpen.onsuccess = e => {
        let db = this.dbOpen.result,
            tx = db.transaction('EventsStore', 'readwrite');
            store = tx.objectStore('EventsStore');

            store.index('title');
            store.index('location');
            store.index('description')

            //general error handler
            db.onerror = e => {
              throw new Error(e.target.error);
            };

            //clear old data on each refresh - causes troubles with cursor. Cursor is incremented instead of being reset after every initiation call.
            store.clear();

            //add initial data to the database
            this.addEvents();

            //add data to the DOM
            this.loadDataToDOM();

            //fired after the initial transaction is completed
            tx.oncomplete = () => {
              console.log('transaction completed');
            };
      };

      this.dbOpen.onerror = e => {
        throw new Error(e.target.error);
      };

      addEventBtn.addEventListener('click', e => { console.log('show modal') });
      restoreDbBtn.addEventListener('click', this.restoreDatabase.bind(this), false);
    };
  },
};

Events.initial()();
