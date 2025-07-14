<script setup>
import { computed } from 'vue'

const props = defineProps({
    components: {
        type: Array,
        required: true
    }
})

const completed = computed(() =>
    props.components.filter(block => block.type === 'block' && block.finished).length)

const total = computed(() =>
    props.components.filter(block => block.type === 'block').length)

const progressPercent = computed(() =>
    total.value === 0 ? 0 : (completed.value / total.value) * 100)

</script>

<template>
    <div class="progress-container pt-4">
        <p class="title">Meu progresso</p>
        <div class="flex justify-content-between align-center mt-2">
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
            <span class="progress-step">({{ completed }}/{{ total }})</span>
            <a href="#" class="see-more">Ver mais</a>
        </div>
    </div>
</template>


<style scoped>
.progress-container {
    min-height: 48px;
    padding: 12px 16px 36px;
    width: 100%;
    background-color: var(--black-50);
}

.title {
    font-weight: 700;
    color: var(--black-700);
    font-size: 12px;
}

.progress-bar {
    height: 8px;
    background-color: var(--black-100);
    border-radius: 4px;
    overflow: hidden;
    width: 100%;
    max-width: 192px;
}

.progress-fill {
    height: 100%;
    background-color: var(--primary-color);
    transition: width 0.3s ease-in-out;
}

.progress-step {
    font-weight: 700;
    font-size: 12px;
    color: var(--black-600);
}

.see-more {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 700;
    font-size: 16px;
}
</style>
