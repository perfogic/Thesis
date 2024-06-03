export interface BlockData {
  id: string;
  height: number;
  version: number;
  timestamp: number;
  txCount: number;
  size: number;
  weight: number;
  merkleRoot: string;
  previousblockhash: string;
  mediantime: number;
  nonce: number;
  bits: number;
  difficulty: number;
}
