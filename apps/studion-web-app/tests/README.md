# Observações sobre os teste atuais

Esses são os testes antigos da SPA que estão sendo ignorados atualmente pelo jest, essa decisão foi
tomada para auxiliar no processo de recuperação dos testes 1 a 1, sem a quebra da execução dos mesmos.

Atualmente a maioria dos testes estão utilizando a biblioteca "@vue/test-utils", porem para estimular
a criação de testes "mais simples e reais", será adotada a biblioteca de testes "@testing-library/vue".

Os testes que possuem a biblioteca antigas e são funcionais serão mantidos a priori.

Referências:

- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles)