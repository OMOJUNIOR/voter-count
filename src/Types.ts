export interface Candidate {
  name: string;
  image: string;
  votes: number;
  party: string;
}

export interface PastVotes {
  timestamp: number;
  votes: Candidate[];
  invalidVotes: number;
  validVotes: number;
  totalVotes: number;
}

export interface ReportConfig {
  centerName: string;
  countyName: string;
  countyCode: string;
  districtNo: string;
  districtCode: string;
  votingCenterNumber:string;
  votingPrecincts: string;
  boxNo: string;
  format: 'PNG' | 'PDF';
}
