import { IsString } from 'class-validator';


export class GitHubLoginDto {
  @IsString()
  githubId!: string;

  @IsString()
  githubLogin!: string;
}
