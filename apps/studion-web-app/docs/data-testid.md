# Documentação: data-testid

## Como utilizar

No projeto da SPA o "data-testid" é definido por um mixin global responsável por definir se o projeto terá ou não a propriedade em ambiente de produção.

    $testId('id-de-teste')

### Exemplo:

```html
<InputField :data-testid="$testId('input-field--username)" />
```

## Padrões de Nomenclatura

### Componentes genéricos

Componentes genéricos devem possuir um data-testid com o seu mesmo nome em Kebab Case, exemplo:

    InputField.vue => 'input-field'

### Formulários

Formulários devem ter seu prefixo declarado pelo contexto e separado por "--"" e terminados com '-form' dentro da tag \<form/>\, exemplo:

    Formulário de SignIn em Auth - SignIn.vue:
    'auth--signin-form'

    Formulário de SignOn - SignOn.vue:
    'auth--signup-form'

```html
<form :data-testid="$testId('auth--signin-form')">
  <!-- ... -->
</form>
```

### Componentes em outros Componentes.

Componentes em outros componentes devem começar com o seu nome e separados por '--' do seu contexto ou função, exemplo:

    InputField's de login em SignIn:
      'input-field--username'
      'input-field--password'
      'link--forgot-password'

### Casos não tão comuns

Em alguns casos são necessários criar artifícios para se adicionar a o data-testid nos componentes,
como é o exemplo do componente Checkbox.vue que foi necessário criar uma função chamada
"getCheckboxItemTestId(item, index)" que é utilizada no loop de CheckboxItem para definir o seu id
de forma dinâmica ou caso seja passado para o componente de forma customizada.

Exemplo

```html
<Checkbox
  v-model="termsConditions"
  :data-testid="$testId('checkbox--terms-conditions')"
  :items="[
    {
      value: true,
      label: $t('tradução'),
      testid: 'tag-customizada',
    },
  ]"
  dark
  @label-link="checkLink"
/>
```

## Ativando e desativando o data-testid em produção

Por padrão a variável de configs 'REMOVE_DATA_TESTID' não é definida, porém caso seja necessário remover o data-testid de alguma instância é necessário apenas defini-la como "true".