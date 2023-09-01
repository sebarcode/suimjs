<template>
    <div>
        <div v-if="columnConfig.labelField!=''">
            {{ record[columnConfig.labelField] }}
        </div>
        <div
            v-else-if="columnConfig.input.lookupUrl!=undefined && columnConfig.input.lookupUrl!='' && labelMethod=='database'">
            {{ data.txt }}
        </div>
        <div v-else-if="Array.isArray(record[columnConfig.field])" class="flex gap-1">
            <div v-for="itv in record[columnConfig.field]">{{ itv }}</div>
        </div>
        <div v-else-if="columnConfig.kind == 'checkbox'" class="flex gap-1 text-center text-green-500">
            <mdicon name="check-bold" size="16" v-if="record[columnConfig.field]" />
        </div>
        <div v-else-if="columnConfig.kind == 'number'" style="text-align:right">
            {{ util.formatMoney(record[columnConfig.field], {decimal:columnConfig.decimal}) }}
        </div>
        <div v-else-if="columnConfig.kind == 'date'">
            <div v-if="moment(record[columnConfig.field]).local().year() >= 1901">
                {{ moment(record[columnConfig.field]).local().format("DD-MMM-YYYY") }}
            </div>
            <div v-else>&nbsp;</div>
        </div>
        <div v-else-if="columnConfig.kind == 'datetime'">
            <div v-if="moment(record[columnConfig.field]).local().year() >= 1901">
                {{ moment(record[columnConfig.field]).local().format("DD-MMM-YYYY HH:mm:ss") }}
            </div>
            <div v-else>&nbsp;</div>
        </div>
        <div v-else>
            {{ record[columnConfig.field] }}
        </div>
    </div>
</template>

<script setup>
import { inject, onMounted, reactive } from 'vue';
import util from '../scripts/util.js';
import moment from 'moment';

const props = defineProps({
    labelMethod: { type: String, default: "none" },
    record: { type: Object, default: () => { } },
    columnConfig: { type: Object, default: () => { } }
})

const axios = inject("axios")

const data = reactive({
    txt: ""
})

function getLabel() {
    if (props.columnConfig.input.lookupUrl != undefined && props.columnConfig.input.lookupUrl != "") {
        //console.log(props.columnConfig.input.lookupUrl)
        axios.post(props.columnConfig.input.lookupUrl, {
            "Where": {
                "Field": "_id", "Op": "$eq",
                "Value": props.record[props.columnConfig.field]
            },
            "Select": props.columnConfig.input.lookupLabels,
            "Take": 1
        }).then(r => {
            if (r.data.length > 0) data.txt = props.columnConfig.input.lookupLabels.map(l => {
                return r.data[0][l]
            }).join(" | ")
            else data.txt = props.record[props.columnConfig.field]
        })
    }
}

onMounted(() => {
    getLabel()
})

</script>