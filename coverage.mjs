import fs from 'fs';
const CSS = ['components.css','patterns.css','landing.css']
  .map(f => [f, fs.readFileSync('/home/claude/ds/' + f, 'utf8')]);
const has = cls => CSS.filter(([, s]) => new RegExp('^\\.' + cls + '[\\s{,:\\[]', 'm').test(s)).map(([f]) => f.replace('.css',''));

// Nuxt UI's public component index, by their own categories. Framework plumbing
// (App, Theme, ColorMode*, i18n, Editor, AI Chat, Dashboard shells, Content) is
// listed but marked n/a: those are Vue components, not design-system pieces.
const NUXT = [
['Layout','Container','spy-container'],
['Layout','Error','spy-empty','partial'],
['Layout','Footer','spy-footer'],
['Layout','Header','spy-mnav'],
['Layout','Sidebar','spy-sidebar'],
['Layout','Splitter',null],
['Layout','App / Main / Theme',null,'n/a'],
['Element','Alert','spy-alert'],
['Element','Avatar','spy-avatar'],
['Element','AvatarGroup','spy-avatar-group'],
['Element','Badge','spy-badge'],
['Element','Banner',null],
['Element','Button','spy-btn'],
['Element','Calendar',null],
['Element','Card','spy-card'],
['Element','Chip','spy-chip'],
['Element','Collapsible','spy-accordion-item','partial'],
['Element','FieldGroup','spy-btn-group','partial'],
['Element','Icon','spy-icon'],
['Element','Kbd','spy-kbd'],
['Element','Progress','spy-progress'],
['Element','ProgressGroup','spy-progress-steps'],
['Element','Separator','spy-divider'],
['Element','Skeleton','spy-skeleton'],
['Form','Checkbox','spy-checkbox'],
['Form','CheckboxGroup',null],
['Form','ColorPicker',null],
['Form','FileUpload','spy-dropzone'],
['Form','Form',null],
['Form','FormField','spy-field'],
['Form','Input','spy-field-control'],
['Form','InputDate',null],
['Form','InputMenu',null],
['Form','InputNumber',null],
['Form','InputRating',null],
['Form','InputTags',null],
['Form','InputTime',null],
['Form','Listbox','spy-menu','partial'],
['Form','PinInput',null],
['Form','RadioGroup','spy-radio-group'],
['Form','Select','spy-select-trigger'],
['Form','SelectMenu',null],
['Form','Slider','spy-slider'],
['Form','Switch','spy-switch'],
['Form','Textarea','spy-field-control'],
['Data','Accordion','spy-accordion'],
['Data','Carousel',null],
['Data','Empty','spy-empty'],
['Data','Marquee',null,'n/a'],
['Data','ScrollArea',null],
['Data','Table','spy-table'],
['Data','Timeline','spy-timeline'],
['Data','Tree',null],
['Data','User','spy-candidate'],
['Navigation','Breadcrumb','spy-breadcrumb'],
['Navigation','CommandPalette','spy-cmdk'],
['Navigation','Link',null],
['Navigation','NavigationMenu','spy-navmenu'],
['Navigation','Pagination','spy-pagination'],
['Navigation','Stepper','spy-stepper'],
['Navigation','Tabs','spy-tabs'],
['Overlay','ContextMenu','spy-menu'],
['Overlay','Drawer',null],
['Overlay','DropdownMenu','spy-menu'],
['Overlay','Modal','spy-modal'],
['Overlay','Popover','spy-nav-popup','partial'],
['Overlay','Slideover','spy-panel','partial'],
['Overlay','Toast','spy-toast'],
['Overlay','Tooltip','spy-tooltip'],
['Page','PageCTA','spy-cta'],
['Page','PageFeature','spy-feature'],
['Page','PageGrid','spy-grid'],
['Page','PageHero','spy-hero'],
['Page','PageLogos','spy-logos'],
['Page','PageSection','spy-section'],
['Page','PageHeader','spy-section-head'],
['Page','PageCard','spy-card'],
['Page','PricingPlan','spy-plan'],
['Page','PricingPlans','spy-grid'],
['Page','PricingTable',null],
['Page','AuthForm',null],
['Page','BlogPost / Changelog / PageAnchors / PageAside / PageLinks / PageList / PageColumns',null,'n/a'],
['Dashboard','DashboardPanel / Navbar / Sidebar / Toolbar / Search','spy-sidebar','partial'],
['Content','ContentNavigation / Search / Toc / Surround',null,'n/a'],
['AI Chat','ChatPrompt','spy-prompt'],
['AI Chat','ChatTool','spy-toolcall'],
['AI Chat','ChatMessage / Messages / Reasoning','spy-composer','partial'],
['Editor','Editor / Toolbar / menus',null,'n/a'],
['Color mode','ColorModeButton / Switch / Select / Avatar / Image',null,'n/a'],
['i18n','LocaleSelect',null,'n/a'],
];

const rows = NUXT.map(([cat, name, cls, note]) => {
  const files = cls ? has(cls) : [];
  const state = note === 'n/a' ? 'n/a'
              : !cls ? 'missing'
              : !files.length ? 'missing'
              : note === 'partial' ? 'partial' : 'have';
  return { cat, name, cls, files, state };
});

const count = s => rows.filter(r => r.state === s).length;
console.log('total listed:', rows.length,
  '| have', count('have'), '| partial', count('partial'), '| missing', count('missing'), '| n/a', count('n/a'));
console.log();
for (const s of ['missing','partial']) {
  console.log('=== ' + s.toUpperCase());
  for (const r of rows.filter(x => x.state === s)) console.log('  ' + r.cat.padEnd(12), r.name.padEnd(22), r.cls || '—', r.files.join(',') || '');
}
fs.writeFileSync('/home/claude/out/coverage.json', JSON.stringify(rows, null, 1));
