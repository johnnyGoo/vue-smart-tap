# vue-smart-tap
##### A Vue.js Component
### Usage
```
npm install vue-smart-tap --save
import VueSmartTap from 'vue-smart-tap'
```
```
npm run dev
npm run build
```


```html
   <div v-tap="tap" >tap</div>
   <div v-tap:long="longTap" >long tap</div>
```

### Install:
```
 Vue.use(VueSmartTap,{time:300,longTime:1000,count:3});
 time tap最长时间，超过此时间不算tap事件
 longTime longtap的触发时间，长按达到这个时间触发事件
 count 最多触发事件次数 仅long时有用
```


```javascript
callback(e) //回调函数 e:Event
```

