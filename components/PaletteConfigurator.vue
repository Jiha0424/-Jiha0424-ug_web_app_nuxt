<script setup>
import { $t, updatePreset, updateSurfacePalette } from '@primevue/themes';
import Aura from '@primevue/themes/aura';
import Lara from '@primevue/themes/lara';
import ConfigurationService from '~/services/ConfiguattionService';

// const { primaryColors, surfaces } = usePalette();
const {
  layoutConfig,
  setPrimary,
  setSurface,
  setPreset,
  isDarkTheme,
  setMenuMode,
} = useLayout();

const presets = {
  Aura,
  Lara,
};

const preset = ref(layoutConfig.preset);
const presetOptions = ref(Object.keys(presets));

const menuMode = ref(layoutConfig.menuMode);
const menuModeOptions = ref([
  { label: 'Static', value: 'static' },
  { label: 'Overlay', value: 'overlay' },
]);

const configurationService = new ConfigurationService();

const primaryColors = ref([]);
const surfaces = ref([]);

const getPresetExt = () => {
  const color = primaryColors.value.find(
    (c) => c.name === layoutConfig.primary
  );

  if (color.name === 'noir') {
    return {
      semantic: {
        primary: {
          50: '{surface.50}',
          100: '{surface.100}',
          200: '{surface.200}',
          300: '{surface.300}',
          400: '{surface.400}',
          500: '{surface.500}',
          600: '{surface.600}',
          700: '{surface.700}',
          800: '{surface.800}',
          900: '{surface.900}',
          950: '{surface.950}',
        },
        colorScheme: {
          light: {
            primary: {
              color: '{primary.950}',
              contrastColor: '#ffffff',
              hoverColor: '{primary.800}',
              activeColor: '{primary.700}',
            },
            highlight: {
              background: '{primary.950}',
              focusBackground: '{primary.700}',
              color: '#ffffff',
              focusColor: '#ffffff',
            },
          },
          dark: {
            primary: {
              color: '{primary.50}',
              contrastColor: '{primary.950}',
              hoverColor: '{primary.200}',
              activeColor: '{primary.300}',
            },
            highlight: {
              background: '{primary.50}',
              focusBackground: '{primary.300}',
              color: '{primary.950}',
              focusColor: '{primary.950}',
            },
          },
        },
      },
    };
  } else {
    return {
      semantic: {
        primary: color.palette,
        colorScheme: {
          light: {
            primary: {
              color: '{primary.500}',
              contrastColor: '#ffffff',
              hoverColor: '{primary.600}',
              activeColor: '{primary.700}',
            },
            highlight: {
              background: '{primary.50}',
              focusBackground: '{primary.100}',
              color: '{primary.700}',
              focusColor: '{primary.800}',
            },
          },
          dark: {
            primary: {
              color: '{primary.400}',
              contrastColor: '{surface.900}',
              hoverColor: '{primary.300}',
              activeColor: '{primary.200}',
            },
            highlight: {
              background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
              focusBackground:
                'color-mix(in srgb, {primary.400}, transparent 76%)',
              color: 'rgba(255,255,255,.87)',
              focusColor: 'rgba(255,255,255,.87)',
            },
          },
        },
      },
    };
  }
};

const updateColors = (type, color) => {
  if (type === 'primary') {
    setPrimary(color.name);
  } else if (type === 'surface') {
    setSurface(color.name);
  }

  applyTheme(type, color);
};

const applyTheme = (type, color) => {
  if (type === 'primary') {
    updatePreset(getPresetExt());
  } else {
    updateSurfacePalette(color.palette);
  }
};

const onPresetChange = () => {
  setPreset(preset.value);

  const presetValue = presets[preset.value];
  const surfacePalette = surfaces.value.find(
    (s) => s.name === layoutConfig.surface
  )?.palette;

  $t()
    .preset(presetValue)
    .preset(getPresetExt())
    .surfacePalette(surfacePalette)
    .use({ useDefaultOptions: true });
};

const onMenuModeChange = () => {
  setMenuMode(menuMode.value);
};

onMounted(() => {
  configurationService
    .getPalette()
    .then((data) => (primaryColors.value = data));
  configurationService.getSurface().then((data) => (surfaces.value = data));
});
</script>

<template>
  <div
    class="config-panel hidden absolute top-[3.25rem] right-0 w-64 p-4 bg-surface-0 dark:bg-surface-900 border border-surface rounded-border origin-top shadow-[0px_3px_5px_rgba(0,0,0,0.02),0px_0px_2px_rgba(0,0,0,0.05),0px_1px_4px_rgba(0,0,0,0.08)]"
  >
    <div class="flex flex-col gap-4">
      <div>
        <span class="text-sm text-muted-color font-semibold">Primary</span>
        <div class="pt-2 flex gap-2 flex-wrap justify-between">
          <button
            v-for="primaryColor of primaryColors"
            :key="primaryColor.name"
            type="button"
            :title="primaryColor.name"
            @click="updateColors('primary', primaryColor)"
            :class="[
              'border-none w-5 h-5 rounded-full p-0 cursor-pointer outline-none outline-offset-1',
              { 'outline-primary': layoutConfig.primary === primaryColor.name },
            ]"
            :style="{
              backgroundColor: `${
                primaryColor.name === 'noir'
                  ? 'var(--text-color)'
                  : primaryColor.palette['500']
              }`,
            }"
          ></button>
        </div>
      </div>
      <div>
        <span class="text-sm text-muted-color font-semibold">Surface</span>
        <div class="pt-2 flex gap-2 flex-wrap justify-between">
          <button
            v-for="surface of surfaces"
            :key="surface.name"
            type="button"
            :title="surface.name"
            @click="updateColors('surface', surface)"
            :class="[
              'border-none w-5 h-5 rounded-full p-0 cursor-pointer outline-none outline-offset-1',
              {
                'outline-primary': layoutConfig.surface
                  ? layoutConfig.surface === surface.name
                  : isDarkTheme
                  ? surface.name === 'zinc'
                  : surface.name === 'slate',
              },
            ]"
            :style="{ backgroundColor: `${surface.palette['500']}` }"
          ></button>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-sm text-muted-color font-semibold">Presets</span>
        <SelectButton
          v-model="preset"
          @change="onPresetChange"
          :options="presetOptions"
          :allowEmpty="false"
        />
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-sm text-muted-color font-semibold">Menu Mode</span>
        <SelectButton
          v-model="menuMode"
          @change="onMenuModeChange"
          :options="menuModeOptions"
          :allowEmpty="false"
          optionLabel="label"
          optionValue="value"
        />
      </div>
    </div>
  </div>
</template>
