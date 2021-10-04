#Event tracker

## Usage
```import { tracker } from 'tracker/dist';```
```
const { unsubscribe } = tracker({
      targets: ['input', 'button'],
      events: ['hover', 'click'],
      id: 'your_custom_id',
      endpoint: 'https://your-api-url'
    });
```
Use ```unsubscribe()``` if you want to disable tracking. 

## Notes
* Set ```logging``` variable into local storage if you want to see event log (using browser's console).
