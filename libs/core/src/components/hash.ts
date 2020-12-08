import * as crypto from 'crypto';
import {
  statSync, writeJSON
} from 'fs-extra';
import * as fs from 'graceful-fs';
import { join, parse } from 'path';

export function _hash(data: Buffer | string, chunkSize = 1024 * 1024 * 5) {
  let buffer: Buffer;
  const hashArray: string[] = [];
  const promise = new Promise<string[]>((resolve, reject) => {
    if (data instanceof Buffer) {
      while (data.length > chunkSize) {
        buffer = data.slice(0, chunkSize);
        data = data.slice(chunkSize);
        hashArray.push(
          crypto.createHash('sha256').update(buffer).digest('hex')
        );
      }
      hashArray.push(crypto.createHash('sha256').update(data).digest('hex'));
    } else {
      fs.open(data, 'r', (err, fd) => {
        fs.fstat(fd, (err, { size }) => {
          let cursor = 0,
            bufferSize = 0;
          while (cursor < size) {
            bufferSize = size - cursor < chunkSize ? size - cursor : chunkSize;
            // console.log(bufferSize);
            buffer = Buffer.alloc(bufferSize);
            fs.readSync(fd, buffer, 0, bufferSize, cursor);
            hashArray.push(
              crypto.createHash('sha256').update(buffer).digest('hex')
            );
            cursor += chunkSize;
          }
          resolve(hashArray);
          // console.log(hashArray);
          // fs.writeFile("hash.text", hashArray);
        });
      });
    }
  });
  return promise;
}

export async function check(
  data: Buffer | string,
  hashArray: string[],
  chunkSize = 1024 * 1024 * 5
) {
  const localArray = await _hash(data, chunkSize);
  // .then(localArray=>)

  const result = hashArray.reduce((sum, hash, index) => {
    const i = localArray[index]
      ? hash === localArray[index]
        ? -1
        : index
      : index;
    if (i !== -1 && i !== hashArray.length - 1) {
      sum.push([chunkSize * i, chunkSize * (i + 1)]);
    }
    if (i === hashArray.length - 1) {
      sum.push([chunkSize * i, Infinity]);
    }
    return sum;
  }, []);

  result.reduce(() => {
    for (let i = 1; i < result.length; i++) {
      if (result[i][0] === result[i - 1][1]) {
        result.splice(i - 1, 2, [result[i - 1][0], result[i][1]]);
        i -= 1;
      }
    }
    return result;
  });

  console.log(result);
}

const datas = [
  // 'E:\\发布版本\\MarsConvertor-3.0.3-setup.zip',
  // 'E:\\发布版本\\MarsConvertor-3.0.2-3.0.3-patch.zip',

  // 'E:\\发布版本\\MpxManager-3.0.0-setup.zip',
  // 'E:\\发布版本\\MarsConvertor-3.0.1-3.0.2-patch.zip',

  // 'E:\\发布版本\\MpxManager-3.0.9-3.1.0-patch.zip',
  // 'E:\\发布版本\\MpxManager-3.1.0-setup.zip',

  // 'E:\\发布版本\\09d32dbb-8aed-4fa2-8004-34b56fe124f1.zip',
  // 'E:\\发布版本\\Mars-3.0.1-3.0.2-patch.zip',
  'E:\\发布版本\\Mars-3.6.0-setup.zip',
  'E:\\发布版本\\Mars-3.5.0-3.6.0-patch.zip',

  // 'E:\\发布版本\\Engine-2.2.1-setup.zip',
  // 'E:\\发布版本\\Engine-2.2.0-2.2.1-patch.zip',

  // 'E:\\发布版本\\案例\\台州市商贸核心区城市设计\\f6e828dd-6643-426c-aebd-3a62afb66fcf.zip'
];
export async function run(paths: string[], chunkSize = 1024 * 1024 * 5) {
  for (const path of paths) {
    const hashes = await _hash(path, chunkSize);
    console.log(`${paths.findIndex((p) => p === path) + 1}/${paths.length}`);
    const p = parse(path);
    console.log(join(p.dir, p.name, 'json'), statSync(path).size);
    await writeJSON(join(p.dir, p.name + '.json'), hashes);
  }
}

export const hash = run;
