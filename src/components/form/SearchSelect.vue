<template>
  <div ref="root" class="search-select" :class="{open,disabled}">
    <button :id="id" type="button" class="form-select search-select-trigger" :disabled="disabled" :aria-expanded="open" aria-haspopup="listbox" @click="toggle">
      <span :class="{'text-muted':!selected}">{{ selected ? optionLabel(selected) : placeholder }}</span>
    </button>
    <div v-if="open" class="search-select-menu">
      <div class="search-select-input"><i class="ph ph-magnifying-glass"></i><input ref="searchInput" v-model="search" type="search" class="form-control" :placeholder="searchPlaceholder" autocomplete="off" @keydown.esc="close"></div>
      <div class="search-select-options" role="listbox">
        <button v-for="option in filteredOptions" :key="String(optionValue(option))" type="button" role="option" :aria-selected="same(optionValue(option),modelValue)" :class="{selected:same(optionValue(option),modelValue)}" @click="choose(option)"><span>{{ optionLabel(option) }}</span><i v-if="same(optionValue(option),modelValue)" class="ph ph-check"></i></button>
        <div v-if="!filteredOptions.length" class="search-select-empty"><i class="ph ph-magnifying-glass"></i>No se encontraron resultados</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import{computed,nextTick,onBeforeUnmount,onMounted,ref}from'vue'
const props=defineProps({modelValue:[String,Number],options:{type:Array,default:()=>[]},id:String,placeholder:{type:String,default:'Seleccione'},searchPlaceholder:{type:String,default:'Buscar…'},disabled:Boolean,valueGetter:Function,labelGetter:Function})
const emit=defineEmits(['update:modelValue','change']),root=ref(null),searchInput=ref(null),open=ref(false),search=ref('')
const optionValue=option=>props.valueGetter?props.valueGetter(option):option?.id??option?.value
const optionLabel=option=>String(props.labelGetter?props.labelGetter(option):option?.label??option?.nombre??option?.name??optionValue(option)??'')
const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
const same=(a,b)=>String(a??'')===String(b??'')
const selected=computed(()=>props.options.find(option=>same(optionValue(option),props.modelValue)))
const filteredOptions=computed(()=>{const term=normalize(search.value);return term?props.options.filter(option=>normalize(optionLabel(option)).includes(term)):props.options})
function toggle(){if(props.disabled)return;open.value=!open.value;if(open.value){search.value='';nextTick(()=>searchInput.value?.focus())}}
function close(){open.value=false;search.value=''}
function choose(option){const value=optionValue(option);emit('update:modelValue',value);emit('change',value,option);close()}
function outside(event){if(open.value&&!root.value?.contains(event.target))close()}
onMounted(()=>document.addEventListener('mousedown',outside));onBeforeUnmount(()=>document.removeEventListener('mousedown',outside))
</script>

<style scoped>
.search-select{position:relative}.search-select-trigger{display:flex;align-items:center;min-height:38px;text-align:left}.search-select-trigger span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.search-select-menu{position:absolute;z-index:1100;top:calc(100% + 4px);left:0;width:100%;min-width:260px;padding:.45rem;border:1px solid #d9e3e9;border-radius:.65rem;background:#fff;box-shadow:0 14px 35px #173d5526}.search-select-input{position:relative}.search-select-input i{position:absolute;z-index:1;top:50%;left:.7rem;transform:translateY(-50%);color:#7b8996}.search-select-input input{padding-left:2rem}.search-select-options{max-height:230px;overflow:auto;margin-top:.35rem}.search-select-options button{display:flex;align-items:center;justify-content:space-between;gap:.5rem;width:100%;padding:.55rem .65rem;border:0;border-radius:.45rem;background:transparent;color:#415566;text-align:left;font-size:.76rem}.search-select-options button:hover,.search-select-options button.selected{background:#eaf5fb;color:#1d789f}.search-select-empty{display:grid;place-items:center;gap:.25rem;padding:1.5rem;color:#7c8b97;text-align:center;font-size:.72rem}.search-select-empty i{font-size:1.25rem}.disabled{opacity:.72}
</style>
