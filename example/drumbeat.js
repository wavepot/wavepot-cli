import note from 'note';
import { tri } from 'osc';
import envelope from 'envelope';
import Sampler from 'sampler';

import kick from './drumkit/BTAA0D3.WAV';
import clap from './drumkit/HANDCLP1.WAV';
import snare from './drumkit/ST0T0S7.WAV';
import ohat from './drumkit/HHOD4.WAV';

var drums = Sampler(12);
drums.tune(1);
drums.add('kick', kick);
drums.add('clap', clap);
drums.add('snare', snare);
drums.add('ohat', ohat);

// 111.9
// 112.5
// 120
// 125
// 126

export let bpm = 125;

var mul = 10e5;

function step(t, sig) {
  t = t * mul | 0;
  sig = sig * mul | 0;
  if (t % sig === 0) return t;
}

export function drumbeat(t){
  if (step(t, 1/4)) drums.play('kick', .35, 0.923);
  if (step(t+1/4+1/8, 1)) drums.play('clap', .15, 2);
  if (step(t+2/4+1/6, 1)) drums.play('clap', .15, 1.7);
  if (step(t+1/4, 1/2)) drums.play('snare', .15, 1);
  if (step(t+1/8, 1/4)) drums.play('ohat', .045, 1.02);
  return drums.mix();
}

var bass_seq = ['c3','f3','d#3','d3'].map(note).reverse();
var bass_n = 0;

export function bass(t){
  if (step(t, 1/16)) bass_n++;
  bass_n %= bass_seq.length;
  return tri(t, bass_seq[bass_n]) * envelope(t, 1/8, 10, 4);
}
