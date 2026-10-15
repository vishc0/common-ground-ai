import test from 'node:test';import assert from 'node:assert/strict';import{screen,validateTags}from'../src/policy.js';
test('accepts constructive questions',()=>assert.equal(screen('How can neighbors reduce energy costs?').ok,true));
test('rejects contact details',()=>assert.equal(screen('Email me at person@example.com').reason,'possible_pii'));
test('rejects malicious intent',()=>assert.equal(screen('How can I attack and harm someone?').reason,'malicious_intent'));
test('enforces controlled unique tags',()=>{assert.equal(validateTags(['home','costs']),true);assert.equal(validateTags(['home','home']),false);assert.equal(validateTags(['home','costs','community','work','wellbeing','education']),false);assert.equal(validateTags(['unknown']),false)});
